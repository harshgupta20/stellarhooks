import "server-only";

import { signPayload } from "@/lib/hmac";
import { WEBHOOK_HEADERS, WEBHOOK_TIMEOUT_MS } from "@/lib/constants";
import { type Event, type Wallet, type Payment } from "@/generated/prisma/client";

export type PaymentWithProduct = Payment & { product: { id: string; name: string } };

/**
 * Build the JSON payload for a webhook delivery. payment.completed uses the
 * Payments-module shape; everything else uses the generic wallet-event shape.
 */
export function buildEventPayload(
  event: Event,
  wallet: Wallet,
  payment?: PaymentWithProduct | null,
): unknown {
  if (event.type === "payment.completed" && payment) {
    return {
      event: "payment.completed",
      productId: payment.productId,
      paymentId: payment.id,
      amount: payment.amount.toString(),
      asset: payment.assetCode,
      wallet: wallet.address,
      transactionHash: payment.transactionHash,
      status: payment.status.toLowerCase(),
      timestamp: payment.createdAt.toISOString(),
    };
  }

  return {
    id: event.id,
    type: event.type,
    createdAt: event.createdAt.toISOString(),
    data: {
      wallet: { id: wallet.id, address: wallet.address },
      amount: event.amount.toString(),
      asset: event.asset,
      from: event.fromAddress,
      to: event.toAddress,
      transactionHash: event.transactionHash,
    },
  };
}

export interface SendResult {
  ok: boolean;
  responseCode: number | null;
  responseTimeMs: number;
  error: string | null;
}

/**
 * Sign and POST a webhook payload. Never throws — network/timeout failures are
 * captured in the returned result so the caller can record the attempt.
 */
export async function sendWebhook(params: {
  url: string;
  secret: string;
  eventType: string;
  deliveryId: string;
  payload: unknown;
}): Promise<SendResult> {
  const body = JSON.stringify(params.payload);
  const timestamp = Date.now().toString();
  const signature = signPayload(params.secret, `${timestamp}.${body}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  const start = Date.now();

  try {
    const res = await fetch(params.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "StellarHooks/1.0",
        [WEBHOOK_HEADERS.signature]: signature,
        [WEBHOOK_HEADERS.timestamp]: timestamp,
        [WEBHOOK_HEADERS.event]: params.eventType,
        [WEBHOOK_HEADERS.delivery]: params.deliveryId,
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    });
    const responseTimeMs = Date.now() - start;

    // Drain the body so the connection can be reused/closed.
    await res.text().catch(() => undefined);

    return {
      ok: res.ok,
      responseCode: res.status,
      responseTimeMs,
      error: res.ok ? null : `Endpoint responded with ${res.status}`,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    const error =
      err instanceof Error && err.name === "AbortError"
        ? `Request timed out after ${WEBHOOK_TIMEOUT_MS}ms`
        : err instanceof Error
          ? err.message
          : "Network error";
    return { ok: false, responseCode: null, responseTimeMs, error };
  } finally {
    clearTimeout(timeout);
  }
}
