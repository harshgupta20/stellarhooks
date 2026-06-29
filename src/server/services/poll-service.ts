import "server-only";

import { prisma } from "@/server/db/prisma";
import { getEnv } from "@/lib/env";
import { fetchPayments } from "@/server/blockchain/horizon-client";
import { mapIncomingPayment } from "@/server/blockchain/payment-mapper";
import { createEventIfNew } from "@/server/services/event-service";
import { createDeliveries, attemptDelivery } from "@/server/services/delivery-service";
import { matchIncomingPayment } from "@/server/services/payment-service";
import { type Wallet } from "@/generated/prisma/client";

export interface PollSummary {
  walletsPolled: number;
  eventsCreated: number;
  deliveriesAttempted: number;
  paymentsConfirmed: number;
  errors: number;
}

export type WebhookIdResolver = (
  userId: string,
  eventType: string,
  network: Wallet["network"],
) => Promise<string[]>;

/** Active webhook ids for a (user, eventType, network), cached per poll run. */
function getWebhookIdsResolver(): WebhookIdResolver {
  const cache = new Map<string, string[]>();
  return async (userId, eventType, network) => {
    const key = `${userId}:${eventType}:${network}`;
    const cached = cache.get(key);
    if (cached) return cached;
    const webhooks = await prisma.webhook.findMany({
      where: { userId, status: "ACTIVE", events: { has: eventType }, network },
      select: { id: true },
    });
    const ids = webhooks.map((w) => w.id);
    cache.set(key, ids);
    return ids;
  };
}

async function pollWallet(
  wallet: Wallet,
  resolveWebhookIds: WebhookIdResolver,
  summary: PollSummary,
): Promise<void> {
  const { POLL_MAX_PAYMENTS_PER_WALLET } = getEnv();

  const records = await fetchPayments({
    network: wallet.network,
    address: wallet.address,
    cursor: wallet.lastCursor,
    limit: POLL_MAX_PAYMENTS_PER_WALLET,
  });

  // Account not found yet (unfunded) — nothing to do, try again next cycle.
  if (records === null) {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { lastSyncAt: new Date() },
    });
    return;
  }

  let cursor = wallet.lastCursor;

  for (const record of records) {
    // Always advance the cursor so outgoing/unrelated records aren't refetched.
    cursor = record.paging_token;

    const payment = mapIncomingPayment(record, wallet.address);
    if (!payment) continue;

    // (1) Generic wallet-monitoring event: payment.received.
    const event = await createEventIfNew(wallet.id, payment);
    if (event) {
      summary.eventsCreated += 1;
      const webhookIds = await resolveWebhookIds(
        wallet.userId,
        "payment.received",
        wallet.network,
      );
      const deliveryIds = await createDeliveries(event.id, webhookIds);
      for (const deliveryId of deliveryIds) {
        await attemptDelivery(deliveryId);
        summary.deliveriesAttempted += 1;
      }
    }

    // (2) Payments module: match to a payment link and fire payment.completed.
    const match = await matchIncomingPayment(wallet, payment, resolveWebhookIds);
    if (match.confirmed) summary.paymentsConfirmed += 1;
    summary.deliveriesAttempted += match.deliveriesAttempted;
  }

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { lastCursor: cursor, lastSyncAt: new Date() },
  });
}

/** Poll every active wallet, create events for new incoming payments, deliver. */
export async function pollAllWallets(): Promise<PollSummary> {
  const summary: PollSummary = {
    walletsPolled: 0,
    eventsCreated: 0,
    deliveriesAttempted: 0,
    paymentsConfirmed: 0,
    errors: 0,
  };

  const wallets = await prisma.wallet.findMany({ where: { status: "ACTIVE" } });
  const resolveWebhookIds = await getWebhookIdsResolver();

  for (const wallet of wallets) {
    try {
      await pollWallet(wallet, resolveWebhookIds, summary);
      summary.walletsPolled += 1;
    } catch (err) {
      summary.errors += 1;
      console.error(`[poll] wallet ${wallet.id} failed:`, err);
    }
  }

  return summary;
}
