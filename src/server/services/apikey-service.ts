import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { generateApiKey, sha256Hex } from "@/lib/hmac";
import { type Network } from "@/lib/constants";

export interface ApiKeyDTO {
  id: string;
  name: string;
  prefix: string;
  network: Network;
  lastUsedAt: string | null;
  createdAt: string;
}

/** Returned only on creation, exposing the raw key once. */
export interface ApiKeyWithSecret extends ApiKeyDTO {
  key: string;
}

export async function listApiKeys(userId: string, network?: Network): Promise<ApiKeyDTO[]> {
  const keys = await prisma.apiKey.findMany({
    where: { userId, ...(network ? { network } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    network: k.network,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }));
}

export async function createApiKey(
  userId: string,
  name: string,
  network: Network = "TESTNET",
): Promise<ApiKeyWithSecret> {
  const { key, prefix } = generateApiKey();
  const created = await prisma.apiKey.create({
    data: { userId, name, prefix, network, hashedKey: sha256Hex(key) },
  });
  return {
    id: created.id,
    name: created.name,
    prefix: created.prefix,
    network: created.network,
    lastUsedAt: null,
    createdAt: created.createdAt.toISOString(),
    key,
  };
}

export async function revokeApiKey(userId: string, id: string): Promise<void> {
  const key = await prisma.apiKey.findFirst({ where: { id, userId }, select: { id: true } });
  if (!key) throw Errors.notFound("API key");
  await prisma.apiKey.delete({ where: { id } });
}

/**
 * Resolve the owning userId for a raw API key, or null if invalid. Updates
 * lastUsedAt on success (best-effort).
 */
export async function verifyApiKey(
  rawKey: string,
): Promise<{ userId: string; network: Network } | null> {
  if (!rawKey.startsWith("sk_")) return null;
  const record = await prisma.apiKey.findUnique({
    where: { hashedKey: sha256Hex(rawKey) },
    select: { id: true, userId: true, network: true },
  });
  if (!record) return null;
  prisma.apiKey
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => undefined);
  return { userId: record.userId, network: record.network };
}
