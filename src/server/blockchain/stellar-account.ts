import "server-only";

import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
  Memo,
  NotFoundError,
} from "@stellar/stellar-sdk";

import { getEnv } from "@/lib/env";
import { type Network } from "@/lib/constants";
import { type HorizonPaymentRecord } from "@/server/blockchain/horizon-client";

export interface AccountBalance {
  assetType: string;
  assetCode: string;
  balance: string;
}

/** Bound Horizon calls so a slow/unreachable node can't hang a page render. */
const HORIZON_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, ms = HORIZON_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Horizon request timed out")), ms),
    ),
  ]);
}

function serverFor(network: Network): Horizon.Server {
  const env = getEnv();
  const url = network === "PUBLIC" ? env.HORIZON_PUBLIC_URL : env.HORIZON_TESTNET_URL;
  return new Horizon.Server(url);
}

function passphraseFor(network: Network): string {
  return network === "PUBLIC" ? Networks.PUBLIC : Networks.TESTNET;
}

/** Generate a fresh Stellar keypair. */
export function generateKeypair(): { publicKey: string; secret: string } {
  const kp = Keypair.random();
  return { publicKey: kp.publicKey(), secret: kp.secret() };
}

/**
 * Load balances for an account. Returns null if the account does not exist yet
 * (unfunded).
 */
export async function loadBalances(
  network: Network,
  publicKey: string,
): Promise<AccountBalance[] | null> {
  try {
    const account = await withTimeout(serverFor(network).loadAccount(publicKey));
    return account.balances.map((b) => ({
      assetType: b.asset_type,
      assetCode: b.asset_type === "native" ? "XLM" : ("asset_code" in b ? b.asset_code : "?"),
      balance: b.balance,
    }));
  } catch (err) {
    if (err instanceof NotFoundError) return null;
    throw err;
  }
}

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

/** Minimum starting balance (XLM) required to create a brand-new account. */
export const MIN_ACCOUNT_CREATION_XLM = 1;

/** Whether an account exists (is funded) on the given network. */
export async function accountExists(network: Network, publicKey: string): Promise<boolean> {
  try {
    await withTimeout(serverFor(network).loadAccount(publicKey));
    return true;
  } catch (err) {
    if (err instanceof NotFoundError) return false;
    throw err;
  }
}

export interface PaymentHistoryItem {
  id: string;
  type: string;
  direction: "in" | "out";
  amount: string;
  asset: string;
  counterparty: string;
  transactionHash: string;
  createdAt: string;
}

function mapHistory(r: HorizonPaymentRecord, self: string): PaymentHistoryItem | null {
  const base = {
    id: r.id,
    transactionHash: r.transaction_hash,
    createdAt: r.created_at,
  };

  if (r.type === "create_account") {
    const incoming = r.account === self;
    if (!incoming && r.funder !== self) return null;
    return {
      ...base,
      type: r.type,
      direction: incoming ? "in" : "out",
      amount: r.starting_balance ?? "0",
      asset: "XLM",
      counterparty: incoming ? (r.funder ?? "") : (r.account ?? ""),
    };
  }

  if (
    r.type === "payment" ||
    r.type === "path_payment_strict_receive" ||
    r.type === "path_payment_strict_send"
  ) {
    const incoming = r.to === self;
    if (!incoming && r.from !== self) return null;
    return {
      ...base,
      type: r.type,
      direction: incoming ? "in" : "out",
      amount: r.amount ?? "0",
      asset: r.asset_type === "native" || !r.asset_type ? "XLM" : (r.asset_code ?? "?"),
      counterparty: incoming ? (r.from ?? "") : (r.to ?? ""),
    };
  }

  return null;
}

/** Recent payment history (newest first) for an account; [] if it doesn't exist yet. */
export async function loadPaymentHistory(
  network: Network,
  publicKey: string,
  limit = 25,
): Promise<PaymentHistoryItem[]> {
  try {
    const page = await withTimeout(
      serverFor(network).payments().forAccount(publicKey).order("desc").limit(limit).call(),
    );
    const records = page.records as unknown as HorizonPaymentRecord[];
    return records
      .map((r) => mapHistory(r, publicKey))
      .filter((x): x is PaymentHistoryItem => x !== null);
  } catch (err) {
    if (err instanceof NotFoundError) return [];
    throw err;
  }
}

function friendlyResultCode(code?: string): string | null {
  switch (code) {
    case "op_underfunded":
      return "Insufficient balance to send this amount";
    case "op_no_destination":
      return "Destination account does not exist yet (it must be funded first)";
    case "tx_insufficient_balance":
      return "Insufficient balance to cover the amount plus network fee";
    case "tx_bad_seq":
      return "Sequence mismatch, please retry";
    default:
      return null;
  }
}

/**
 * Build, sign, and submit a native XLM payment from the custodial wallet.
 * Returns the transaction hash. Throws PaymentError with a friendly message.
 */
export async function submitNativePayment(params: {
  network: Network;
  sourceSecret: string;
  destination: string;
  amount: string;
  memo?: string;
}): Promise<{ hash: string }> {
  const server = serverFor(params.network);
  const keypair = Keypair.fromSecret(params.sourceSecret);

  let source;
  try {
    source = await server.loadAccount(keypair.publicKey());
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new PaymentError("This wallet is not funded yet");
    }
    throw err;
  }

  // If the destination doesn't exist on this network yet, create it (which also
  // funds it) instead of a plain payment, which would fail with op_no_destination.
  const destinationExists = await accountExists(params.network, params.destination);
  if (!destinationExists && Number(params.amount) < MIN_ACCOUNT_CREATION_XLM) {
    throw new PaymentError(
      `This address doesn't exist on the network yet, so this payment creates it — which needs at least ${MIN_ACCOUNT_CREATION_XLM} XLM`,
    );
  }

  const operation = destinationExists
    ? Operation.payment({
        destination: params.destination,
        asset: Asset.native(),
        amount: params.amount,
      })
    : Operation.createAccount({
        destination: params.destination,
        startingBalance: params.amount,
      });

  const builder = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: passphraseFor(params.network),
  }).addOperation(operation);

  if (params.memo) builder.addMemo(Memo.text(params.memo));

  const tx = builder.setTimeout(60).build();
  tx.sign(keypair);

  try {
    const res = await server.submitTransaction(tx);
    return { hash: res.hash };
  } catch (err) {
    const extras =
      err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { extras?: { result_codes?: Record<string, unknown> } } } })
            .response?.data?.extras
        : undefined;
    const codes = extras?.result_codes;
    const opCode = Array.isArray(codes?.operations) ? String(codes.operations[0]) : undefined;
    const txCode = typeof codes?.transaction === "string" ? codes.transaction : undefined;
    const friendly = friendlyResultCode(opCode) ?? friendlyResultCode(txCode);
    throw new PaymentError(friendly ?? "Payment failed to submit. Please try again.");
  }
}
