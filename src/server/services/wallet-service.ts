import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { assertWithinPlanLimit } from "@/server/services/plan-service";
import {
  createWalletSchema,
  updateWalletSchema,
  type CreateWalletInput,
  type UpdateWalletInput,
} from "@/features/wallets/schemas";
import { type WalletDTO } from "@/features/wallets/types";
import { type Wallet } from "@/generated/prisma/client";
import { type Network } from "@/lib/constants";
import { fetchLatestCursor } from "@/server/blockchain/horizon-client";

function toDTO(wallet: Wallet): WalletDTO {
  return {
    id: wallet.id,
    name: wallet.name,
    address: wallet.address,
    network: wallet.network,
    status: wallet.status,
    lastSyncAt: wallet.lastSyncAt?.toISOString() ?? null,
    createdAt: wallet.createdAt.toISOString(),
  };
}

export async function listWallets(userId: string, network?: Network): Promise<WalletDTO[]> {
  const wallets = await prisma.wallet.findMany({
    where: { userId, ...(network ? { network } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return wallets.map(toDTO);
}

async function findOwnedWallet(userId: string, id: string): Promise<Wallet> {
  const wallet = await prisma.wallet.findFirst({ where: { id, userId } });
  if (!wallet) throw Errors.notFound("Wallet");
  return wallet;
}

export async function getWallet(userId: string, id: string): Promise<WalletDTO> {
  return toDTO(await findOwnedWallet(userId, id));
}

export async function createWallet(userId: string, input: CreateWalletInput): Promise<WalletDTO> {
  const data = createWalletSchema.parse(input);
  await assertWithinPlanLimit(userId, "wallets");

  const existing = await prisma.wallet.findFirst({
    where: { userId, address: data.address, network: data.network },
    select: { id: true },
  });
  if (existing) {
    throw Errors.conflict("This address is already registered on this network");
  }

  // Watch from "now": seed the cursor with the account's latest payment so we
  // don't replay its entire history. Best-effort — if the account doesn't exist
  // yet (unfunded), the cursor stays null and the poller starts from its first
  // payment (the funding transaction).
  let lastCursor: string | null = null;
  try {
    lastCursor = await fetchLatestCursor({ network: data.network, address: data.address });
  } catch {
    lastCursor = null;
  }

  const wallet = await prisma.wallet.create({
    data: {
      userId,
      name: data.name,
      address: data.address,
      network: data.network,
      lastCursor,
    },
  });
  return toDTO(wallet);
}

export async function updateWallet(
  userId: string,
  id: string,
  input: UpdateWalletInput,
): Promise<WalletDTO> {
  const data = updateWalletSchema.parse(input);
  await findOwnedWallet(userId, id);

  const wallet = await prisma.wallet.update({
    where: { id },
    data,
  });
  return toDTO(wallet);
}

export async function deleteWallet(userId: string, id: string): Promise<void> {
  await findOwnedWallet(userId, id);
  await prisma.wallet.delete({ where: { id } });
}
