import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { buildEventPayload, sendWebhook } from "@/server/delivery/dispatcher";
import { nextRetryAfter } from "@/server/delivery/retry-policy";
import { buildPageMeta, type PageMeta, type PageParams } from "@/lib/pagination";
import { type DeliveryDTO } from "@/features/deliveries/types";
import { type DeliveryStatus } from "@/generated/prisma/enums";
import { type Network } from "@/lib/constants";

/** Create one PENDING delivery per webhook for a freshly created event. */
export async function createDeliveries(eventId: string, webhookIds: string[]): Promise<string[]> {
  if (webhookIds.length === 0) return [];
  await prisma.delivery.createMany({
    data: webhookIds.map((webhookId) => ({ eventId, webhookId })),
  });
  const created = await prisma.delivery.findMany({
    where: { eventId, webhookId: { in: webhookIds } },
    select: { id: true },
  });
  return created.map((d) => d.id);
}

/**
 * Attempt a single delivery: sign + POST, then persist the outcome and schedule
 * a retry if attempts remain. Idempotent against already-finished deliveries.
 */
export async function attemptDelivery(deliveryId: string): Promise<void> {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      webhook: true,
      event: {
        include: {
          wallet: true,
          payment: { include: { product: { select: { id: true, name: true } } } },
        },
      },
    },
  });

  if (!delivery) return;
  if (delivery.status === "SUCCESS" || delivery.status === "EXHAUSTED") return;

  const attempts = delivery.attempts + 1;
  const payload = buildEventPayload(
    delivery.event,
    delivery.event.wallet,
    delivery.event.payment,
  );

  const result = await sendWebhook({
    url: delivery.webhook.url,
    secret: delivery.webhook.secret,
    eventType: delivery.event.type,
    deliveryId: delivery.id,
    payload,
  });

  if (result.ok) {
    await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status: "SUCCESS",
        attempts,
        responseCode: result.responseCode,
        responseTimeMs: result.responseTimeMs,
        nextRetryAt: null,
        lastError: null,
      },
    });
    return;
  }

  const retryAt = nextRetryAfter(attempts);
  await prisma.delivery.update({
    where: { id: delivery.id },
    data: {
      status: retryAt ? "FAILED" : "EXHAUSTED",
      attempts,
      responseCode: result.responseCode,
      responseTimeMs: result.responseTimeMs,
      nextRetryAt: retryAt,
      lastError: result.error,
    },
  });
}

/** Deliveries that have failed and are due for another attempt. */
export async function getDueRetryDeliveryIds(limit: number): Promise<string[]> {
  const due = await prisma.delivery.findMany({
    where: { status: "FAILED", nextRetryAt: { lte: new Date() } },
    orderBy: { nextRetryAt: "asc" },
    take: limit,
    select: { id: true },
  });
  return due.map((d) => d.id);
}

/** Manually re-queue and immediately re-attempt a delivery (owner-scoped). */
export async function replayDelivery(userId: string, deliveryId: string): Promise<void> {
  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, webhook: { userId } },
    select: { id: true },
  });
  if (!delivery) throw Errors.notFound("Delivery");

  await prisma.delivery.update({
    where: { id: deliveryId },
    data: { status: "PENDING", nextRetryAt: null, lastError: null },
  });
  await attemptDelivery(deliveryId);
}

export interface ListDeliveriesResult {
  deliveries: DeliveryDTO[];
  meta: PageMeta;
}

export async function listDeliveries(
  userId: string,
  params: PageParams,
  filters: { status?: DeliveryStatus; network?: Network } = {},
): Promise<ListDeliveriesResult> {
  const where = {
    webhook: { userId, ...(filters.network ? { network: filters.network } : {}) },
    ...(filters.status ? { status: filters.status } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.delivery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
      include: {
        webhook: { select: { id: true, name: true, url: true } },
        event: {
          select: { id: true, type: true, amount: true, asset: true, transactionHash: true },
        },
      },
    }),
    prisma.delivery.count({ where }),
  ]);

  const deliveries: DeliveryDTO[] = rows.map((row) => ({
    id: row.id,
    status: row.status,
    attempts: row.attempts,
    responseCode: row.responseCode,
    responseTimeMs: row.responseTimeMs,
    nextRetryAt: row.nextRetryAt?.toISOString() ?? null,
    lastError: row.lastError,
    createdAt: row.createdAt.toISOString(),
    webhook: row.webhook,
    event: { ...row.event, amount: row.event.amount.toString() },
  }));

  return { deliveries, meta: buildPageMeta(params, total) };
}
