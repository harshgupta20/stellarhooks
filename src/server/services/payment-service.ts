import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { isNativeAsset } from "@/lib/stellar";
import { buildPageMeta, type PageMeta, type PageParams } from "@/lib/pagination";
import { type NormalizedPayment } from "@/server/blockchain/payment-mapper";
import { createEventIfNew } from "@/server/services/event-service";
import { createDeliveries, attemptDelivery } from "@/server/services/delivery-service";
import { type PaymentDTO, type RevenueStats } from "@/features/payments/types";
import {
  type Prisma,
  type Wallet,
  type PaymentStatus,
} from "@/generated/prisma/client";

type PaymentRow = Prisma.PaymentModel & { product: { id: string; name: string } };

const include = { product: { select: { id: true, name: true } } } as const;

function toDTO(p: PaymentRow): PaymentDTO {
  return {
    id: p.id,
    status: p.status,
    amount: p.amount.toString(),
    assetCode: p.assetCode,
    assetIssuer: p.assetIssuer,
    memo: p.memo,
    senderAddress: p.senderAddress,
    receiverAddress: p.receiverAddress,
    transactionHash: p.transactionHash,
    product: p.product,
    paymentLinkId: p.paymentLinkId,
    createdAt: p.createdAt.toISOString(),
  };
}

// ---------------- Read APIs ----------------

export interface ListPaymentsResult {
  payments: PaymentDTO[];
  meta: PageMeta;
}

export async function listPayments(
  userId: string,
  params: PageParams,
  opts: {
    status?: PaymentStatus;
    productId?: string;
    network?: "TESTNET" | "PUBLIC";
    sortOrder?: "asc" | "desc";
  } = {},
): Promise<ListPaymentsResult> {
  const where: Prisma.PaymentWhereInput = {
    userId,
    ...(opts.status ? { status: opts.status } : {}),
    ...(opts.productId ? { productId: opts.productId } : {}),
    ...(opts.network ? { wallet: { network: opts.network } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include,
      orderBy: { createdAt: opts.sortOrder ?? "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.payment.count({ where }),
  ]);
  return { payments: rows.map(toDTO), meta: buildPageMeta(params, total) };
}

export async function getPayment(userId: string, id: string): Promise<PaymentDTO> {
  const payment = await prisma.payment.findFirst({ where: { id, userId }, include });
  if (!payment) throw Errors.notFound("Payment");
  return toDTO(payment);
}

export async function getRevenueStats(
  userId: string,
  network?: "TESTNET" | "PUBLIC",
): Promise<RevenueStats> {
  const networkFilter = network ? { wallet: { network } } : {};
  const [grouped, paymentsConfirmed, paymentsPending] = await Promise.all([
    prisma.payment.groupBy({
      by: ["assetCode"],
      where: { userId, status: "CONFIRMED", ...networkFilter },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { userId, status: "CONFIRMED", ...networkFilter } }),
    prisma.payment.count({ where: { userId, status: "PENDING", ...networkFilter } }),
  ]);

  return {
    paymentsConfirmed,
    paymentsPending,
    revenueByAsset: grouped.map((g) => ({
      asset: g.assetCode,
      total: g._sum.amount?.toString() ?? "0",
    })),
  };
}

// ---------------- Detection / matcher ----------------

export interface PaymentMatchResult {
  matched: boolean;
  confirmed: boolean;
  deliveriesAttempted: number;
}

const NO_MATCH: PaymentMatchResult = { matched: false, confirmed: false, deliveriesAttempted: 0 };

function amountIsSufficient(
  priceType: "FIXED" | "CUSTOM",
  paid: string,
  price: string | null,
  minAmount: string | null,
): boolean {
  const paidNum = Number(paid);
  if (priceType === "FIXED") return price !== null && paidNum >= Number(price);
  return paidNum >= Number(minAmount ?? "0");
}

/**
 * Try to match an incoming wallet payment to an active payment link (by memo),
 * verify it, record a Payment, and — if valid — fire payment.completed through
 * the existing webhook delivery pipeline. Idempotent on transaction hash.
 */
export async function matchIncomingPayment(
  wallet: Wallet,
  payment: NormalizedPayment,
  resolveWebhookIds: (
    userId: string,
    eventType: string,
    network: Wallet["network"],
  ) => Promise<string[]>,
): Promise<PaymentMatchResult> {
  if (!payment.memo) return NO_MATCH;

  const link = await prisma.paymentLink.findUnique({
    where: { memo: payment.memo },
    include: { product: true },
  });
  if (!link || !link.active || !link.product.active) return NO_MATCH;
  // The payment must have landed on the product's configured wallet.
  if (link.product.walletId !== wallet.id) return NO_MATCH;

  // Idempotency: never record the same transaction twice.
  const existing = await prisma.payment.findUnique({
    where: { transactionHash: payment.transactionHash },
    select: { id: true },
  });
  if (existing) return { matched: true, confirmed: false, deliveriesAttempted: 0 };

  const product = link.product;
  const assetMatches =
    payment.asset === product.assetCode &&
    (isNativeAsset(product.assetCode) || payment.assetIssuer === product.assetIssuer);
  const amountOk = amountIsSufficient(
    product.priceType,
    payment.amount,
    product.price?.toString() ?? null,
    product.minAmount?.toString() ?? null,
  );
  const valid = assetMatches && amountOk;

  const record = await prisma.payment.create({
    data: {
      userId: product.userId,
      productId: product.id,
      paymentLinkId: link.id,
      walletId: wallet.id,
      amount: payment.amount,
      assetCode: payment.asset,
      assetIssuer: payment.assetIssuer,
      memo: payment.memo,
      senderAddress: payment.fromAddress || null,
      receiverAddress: payment.toAddress,
      transactionHash: payment.transactionHash,
      ledgerCursor: payment.pagingToken,
      status: valid ? "CONFIRMED" : "FAILED",
    },
  });

  if (!valid) return { matched: true, confirmed: false, deliveriesAttempted: 0 };

  // Fire payment.completed through the shared Event → Delivery pipeline.
  const event = await createEventIfNew(wallet.id, payment, "payment.completed", record.id);
  if (!event) return { matched: true, confirmed: true, deliveriesAttempted: 0 };

  const webhookIds = await resolveWebhookIds(product.userId, "payment.completed", wallet.network);
  const deliveryIds = await createDeliveries(event.id, webhookIds);
  for (const deliveryId of deliveryIds) {
    await attemptDelivery(deliveryId);
  }

  return { matched: true, confirmed: true, deliveriesAttempted: deliveryIds.length };
}
