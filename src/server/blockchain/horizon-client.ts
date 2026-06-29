import "server-only";

import { getEnv } from "@/lib/env";
import { type Network } from "@/lib/constants";

/** Raw payment-style record returned by Horizon's /payments endpoint. */
export interface HorizonPaymentRecord {
  id: string;
  paging_token: string;
  type:
    | "payment"
    | "create_account"
    | "path_payment_strict_receive"
    | "path_payment_strict_send"
    | string;
  transaction_hash: string;
  created_at: string;
  // payment / path_payment
  from?: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  // create_account
  funder?: string;
  account?: string;
  starting_balance?: string;
  // embedded via join=transactions
  transaction?: {
    memo?: string;
    memo_type?: string;
  };
}

interface HorizonPaymentsResponse {
  _embedded?: { records?: HorizonPaymentRecord[] };
}

export class HorizonError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "HorizonError";
  }
}

function baseUrl(network: Network): string {
  const env = getEnv();
  return network === "PUBLIC" ? env.HORIZON_PUBLIC_URL : env.HORIZON_TESTNET_URL;
}

async function getJson(url: string): Promise<HorizonPaymentsResponse | null> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  // Account not found / not yet funded — treat as "nothing to process".
  if (res.status === 404) return null;

  if (!res.ok) {
    throw new HorizonError(`Horizon request failed (${res.status})`, res.status);
  }
  return (await res.json()) as HorizonPaymentsResponse;
}

/**
 * Fetch payment records for an account in ascending order after `cursor`.
 * Returns [] when the account exists but has no new payments, and null when the
 * account does not exist yet.
 */
export async function fetchPayments(params: {
  network: Network;
  address: string;
  cursor?: string | null;
  limit: number;
}): Promise<HorizonPaymentRecord[] | null> {
  const query = new URLSearchParams({
    order: "asc",
    limit: String(params.limit),
    // Embed the transaction so we can read its memo (used to match payments).
    join: "transactions",
  });
  if (params.cursor) query.set("cursor", params.cursor);

  const url = `${baseUrl(params.network)}/accounts/${params.address}/payments?${query.toString()}`;
  const json = await getJson(url);
  if (json === null) return null;
  return json._embedded?.records ?? [];
}

/**
 * Return the most recent payment's paging_token, used to "start watching from
 * now" when a wallet is first polled. Null if the account has no payments yet.
 */
export async function fetchLatestCursor(params: {
  network: Network;
  address: string;
}): Promise<string | null> {
  const url = `${baseUrl(params.network)}/accounts/${params.address}/payments?order=desc&limit=1`;
  const json = await getJson(url);
  const record = json?._embedded?.records?.[0];
  return record?.paging_token ?? null;
}
