import "server-only";

import { prisma } from "@/server/db/prisma";
import { type NormalizedPayment } from "@/server/blockchain/payment-mapper";
import { type Event } from "@/generated/prisma/client";
import { type EventDTO } from "@/features/events/types";
import { type Network } from "@/lib/constants";
import { buildPageMeta, type PageMeta, type PageParams } from "@/lib/pagination";

/**
 * Create a payment.received event for a wallet, unless one already exists for
 * this (wallet, transactionHash). Returns the new event, or null if it was a
 * duplicate (already processed).
 */
export async function createEventIfNew(
  walletId: string,
  payment: NormalizedPayment,
  type: string = "payment.received",
  paymentId?: string,
): Promise<Event | null> {
  const existing = await prisma.event.findUnique({
    where: {
      walletId_transactionHash_type: {
        walletId,
        transactionHash: payment.transactionHash,
        type,
      },
    },
    select: { id: true },
  });
  if (existing) return null;

  try {
    return await prisma.event.create({
      data: {
        walletId,
        type,
        amount: payment.amount,
        asset: payment.asset,
        fromAddress: payment.fromAddress,
        toAddress: payment.toAddress,
        transactionHash: payment.transactionHash,
        ledgerCursor: payment.pagingToken,
        createdAt: payment.createdAt,
        ...(paymentId ? { paymentId } : {}),
      },
    });
  } catch (err) {
    // Lost a race on the unique constraint — treat as already processed.
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return null;
    }
    throw err;
  }
}

export interface ListEventsResult {
  events: EventDTO[];
  meta: PageMeta;
}

export async function listEvents(
  userId: string,
  params: PageParams,
  filters: { walletId?: string; network?: Network } = {},
): Promise<ListEventsResult> {
  const where = {
    wallet: {
      userId,
      ...(filters.walletId ? { id: filters.walletId } : {}),
      ...(filters.network ? { network: filters.network } : {}),
    },
  };

  const [rows, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
      include: {
        wallet: { select: { id: true, name: true, address: true, network: true } },
        deliveries: { select: { status: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const events: EventDTO[] = rows.map((row) => {
    const summary = {
      total: row.deliveries.length,
      success: row.deliveries.filter((d) => d.status === "SUCCESS").length,
      pending: row.deliveries.filter((d) => d.status === "PENDING").length,
      failed: row.deliveries.filter((d) => d.status === "FAILED" || d.status === "EXHAUSTED")
        .length,
    };
    return {
      id: row.id,
      type: row.type,
      amount: row.amount.toString(),
      asset: row.asset,
      fromAddress: row.fromAddress,
      toAddress: row.toAddress,
      transactionHash: row.transactionHash,
      createdAt: row.createdAt.toISOString(),
      wallet: row.wallet,
      deliverySummary: summary,
    };
  });

  return { events, meta: buildPageMeta(params, total) };
}
