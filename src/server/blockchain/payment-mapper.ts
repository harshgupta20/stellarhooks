import "server-only";

import { type HorizonPaymentRecord } from "@/server/blockchain/horizon-client";

export interface NormalizedPayment {
  transactionHash: string;
  pagingToken: string;
  amount: string;
  asset: string;
  assetIssuer: string | null;
  fromAddress: string;
  toAddress: string;
  memo: string | null;
  createdAt: Date;
}

function assetLabel(record: HorizonPaymentRecord): string {
  if (record.asset_type === "native" || !record.asset_type) return "XLM";
  return record.asset_code ?? "UNKNOWN";
}

/** Text memo of the payment's transaction, or null. */
function memoOf(record: HorizonPaymentRecord): string | null {
  const t = record.transaction;
  if (!t || !t.memo) return null;
  // Only text memos are used for matching payment links.
  if (t.memo_type && t.memo_type !== "text") return null;
  return t.memo;
}

/**
 * Convert a Horizon record into a normalized incoming payment for
 * `walletAddress`, or null when the record is not an inbound transfer to it.
 */
export function mapIncomingPayment(
  record: HorizonPaymentRecord,
  walletAddress: string,
): NormalizedPayment | null {
  const base = {
    transactionHash: record.transaction_hash,
    pagingToken: record.paging_token,
    memo: memoOf(record),
    createdAt: new Date(record.created_at),
  };

  if (
    (record.type === "payment" ||
      record.type === "path_payment_strict_receive" ||
      record.type === "path_payment_strict_send") &&
    record.to === walletAddress &&
    record.amount
  ) {
    return {
      ...base,
      amount: record.amount,
      asset: assetLabel(record),
      assetIssuer: record.asset_type === "native" ? null : (record.asset_issuer ?? null),
      fromAddress: record.from ?? "",
      toAddress: record.to,
    };
  }

  if (
    record.type === "create_account" &&
    record.account === walletAddress &&
    record.starting_balance
  ) {
    return {
      ...base,
      amount: record.starting_balance,
      asset: "XLM",
      assetIssuer: null,
      fromAddress: record.funder ?? "",
      toAddress: record.account,
    };
  }

  return null;
}
