import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { assertWithinPlanLimit } from "@/server/services/plan-service";
import { encryptSecret, decryptSecret } from "@/server/crypto/secret-vault";
import {
  generateKeypair,
  loadBalances,
  loadPaymentHistory,
  submitNativePayment,
  accountExists,
  PaymentError,
  type AccountBalance,
} from "@/server/blockchain/stellar-account";
import { isValidStellarPublicKey } from "@/lib/stellar";
import { type Network } from "@/generated/prisma/enums";
import {
  createCloudWalletSchema,
  sendPaymentSchema,
  type CreateCloudWalletInput,
  type SendPaymentInput,
} from "@/features/cloud-wallets/schemas";
import {
  type CloudWalletDTO,
  type CloudWalletWithSecretDTO,
  type SendPaymentResult,
  type CloudWalletHistoryItem,
} from "@/features/cloud-wallets/types";
import { type CloudWallet } from "@/generated/prisma/client";

function toDTO(wallet: CloudWallet, balances: AccountBalance[] | null): CloudWalletDTO {
  return {
    id: wallet.id,
    name: wallet.name,
    network: wallet.network,
    publicKey: wallet.publicKey,
    funded: balances !== null,
    balances: balances ?? [],
    createdAt: wallet.createdAt.toISOString(),
  };
}

async function safeLoadBalances(
  network: CloudWallet["network"],
  publicKey: string,
): Promise<AccountBalance[] | null> {
  try {
    return await loadBalances(network, publicKey);
  } catch {
    // Horizon unavailable — present as unknown/unfunded rather than failing the list.
    return null;
  }
}

async function findOwned(userId: string, id: string): Promise<CloudWallet> {
  const wallet = await prisma.cloudWallet.findFirst({ where: { id, userId } });
  if (!wallet) throw Errors.notFound("Cloud wallet");
  return wallet;
}

export async function listCloudWallets(
  userId: string,
  network?: "TESTNET" | "PUBLIC",
): Promise<CloudWalletDTO[]> {
  const wallets = await prisma.cloudWallet.findMany({
    where: { userId, ...(network ? { network } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(
    wallets.map(async (w) => toDTO(w, await safeLoadBalances(w.network, w.publicKey))),
  );
}

export async function getCloudWallet(userId: string, id: string): Promise<CloudWalletDTO> {
  const wallet = await findOwned(userId, id);
  return toDTO(wallet, await safeLoadBalances(wallet.network, wallet.publicKey));
}

export interface CloudWalletDetail {
  wallet: CloudWalletDTO;
  history: CloudWalletHistoryItem[];
}

/** Wallet + balances + recent on-chain payment history, for the detail page. */
export async function getCloudWalletDetail(
  userId: string,
  id: string,
): Promise<CloudWalletDetail> {
  const wallet = await findOwned(userId, id);
  const [balances, history] = await Promise.all([
    safeLoadBalances(wallet.network, wallet.publicKey),
    loadPaymentHistory(wallet.network, wallet.publicKey).catch(() => []),
  ]);
  return { wallet: toDTO(wallet, balances), history };
}

export async function createCloudWallet(
  userId: string,
  input: CreateCloudWalletInput,
): Promise<CloudWalletWithSecretDTO> {
  const data = createCloudWalletSchema.parse(input);
  await assertWithinPlanLimit(userId, "cloudWallets");
  const { publicKey, secret } = generateKeypair();

  const wallet = await prisma.cloudWallet.create({
    data: {
      userId,
      name: data.name,
      network: data.network,
      publicKey,
      encryptedSecret: encryptSecret(secret),
    },
  });

  return { ...toDTO(wallet, []), secret };
}

export async function fundCloudWallet(userId: string, id: string): Promise<CloudWalletDTO> {
  const wallet = await findOwned(userId, id);
  if (wallet.network !== "TESTNET") {
    throw Errors.badRequest("Funding is only available on testnet");
  }

  const res = await fetch(`https://friendbot.stellar.org/?addr=${wallet.publicKey}`);
  if (!res.ok && res.status !== 400) {
    throw Errors.badRequest("Friendbot could not fund this wallet right now");
  }

  return toDTO(wallet, await safeLoadBalances(wallet.network, wallet.publicKey));
}

export async function sendPayment(
  userId: string,
  id: string,
  input: SendPaymentInput,
): Promise<SendPaymentResult> {
  const data = sendPaymentSchema.parse(input);
  const wallet = await findOwned(userId, id);

  if (data.destination === wallet.publicKey) {
    throw Errors.badRequest("Destination must be different from the source wallet");
  }

  const secret = decryptSecret(wallet.encryptedSecret);
  try {
    return await submitNativePayment({
      network: wallet.network,
      sourceSecret: secret,
      destination: data.destination,
      amount: data.amount,
      memo: data.memo,
    });
  } catch (err) {
    if (err instanceof PaymentError) throw Errors.badRequest(err.message);
    throw err;
  }
}

export async function deleteCloudWallet(userId: string, id: string): Promise<void> {
  await findOwned(userId, id);
  await prisma.cloudWallet.delete({ where: { id } });
}

export interface DestinationStatus {
  valid: boolean;
  /** Exists on the wallet's network. null when validity is false or Horizon is unreachable. */
  exists: boolean | null;
  isSelf: boolean;
  network: Network;
}

/**
 * Check a prospective destination against the wallet's network so the UI can
 * tell the user whether the address is valid and whether a payment will create
 * the account (if it doesn't exist yet).
 */
export async function checkDestination(
  userId: string,
  id: string,
  address: string,
): Promise<DestinationStatus> {
  const wallet = await findOwned(userId, id);
  const valid = isValidStellarPublicKey(address);
  if (!valid) {
    return { valid: false, exists: null, isSelf: false, network: wallet.network };
  }

  let exists: boolean | null;
  try {
    exists = await accountExists(wallet.network, address);
  } catch {
    exists = null; // Horizon unreachable — don't block the user.
  }

  return {
    valid: true,
    exists,
    isSelf: address === wallet.publicKey,
    network: wallet.network,
  };
}
