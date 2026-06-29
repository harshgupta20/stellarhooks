import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { assertWithinPlanLimit } from "@/server/services/plan-service";
import { generateWebhookSecret } from "@/lib/hmac";
import { type EventType } from "@/lib/constants";
import {
  createWebhookSchema,
  updateWebhookSchema,
  type CreateWebhookInput,
  type UpdateWebhookInput,
} from "@/features/webhooks/schemas";
import { type WebhookDTO, type WebhookWithSecretDTO } from "@/features/webhooks/types";
import { type Webhook } from "@/generated/prisma/client";
import { type Network } from "@/lib/constants";

function maskSecret(secret: string): string {
  const last4 = secret.slice(-4);
  return `whsec_••••${last4}`;
}

function toDTO(webhook: Webhook): WebhookDTO {
  return {
    id: webhook.id,
    name: webhook.name,
    url: webhook.url,
    events: webhook.events as EventType[],
    network: webhook.network,
    status: webhook.status,
    secretMasked: maskSecret(webhook.secret),
    createdAt: webhook.createdAt.toISOString(),
  };
}

function toDTOWithSecret(webhook: Webhook): WebhookWithSecretDTO {
  return { ...toDTO(webhook), secret: webhook.secret };
}

export async function listWebhooks(userId: string, network?: Network): Promise<WebhookDTO[]> {
  const webhooks = await prisma.webhook.findMany({
    where: { userId, ...(network ? { network } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return webhooks.map(toDTO);
}

async function findOwnedWebhook(userId: string, id: string): Promise<Webhook> {
  const webhook = await prisma.webhook.findFirst({ where: { id, userId } });
  if (!webhook) throw Errors.notFound("Webhook");
  return webhook;
}

export async function getWebhook(userId: string, id: string): Promise<WebhookDTO> {
  return toDTO(await findOwnedWebhook(userId, id));
}

export async function createWebhook(
  userId: string,
  input: CreateWebhookInput,
  network: Network = "TESTNET",
): Promise<WebhookWithSecretDTO> {
  const data = createWebhookSchema.parse(input);
  await assertWithinPlanLimit(userId, "webhooks");
  const webhook = await prisma.webhook.create({
    data: {
      userId,
      name: data.name,
      url: data.url,
      events: data.events,
      network,
      secret: generateWebhookSecret(),
    },
  });
  return toDTOWithSecret(webhook);
}

export async function updateWebhook(
  userId: string,
  id: string,
  input: UpdateWebhookInput,
): Promise<WebhookDTO> {
  const data = updateWebhookSchema.parse(input);
  await findOwnedWebhook(userId, id);
  const webhook = await prisma.webhook.update({ where: { id }, data });
  return toDTO(webhook);
}

export async function rotateSecret(userId: string, id: string): Promise<WebhookWithSecretDTO> {
  await findOwnedWebhook(userId, id);
  const webhook = await prisma.webhook.update({
    where: { id },
    data: { secret: generateWebhookSecret() },
  });
  return toDTOWithSecret(webhook);
}

export async function deleteWebhook(userId: string, id: string): Promise<void> {
  await findOwnedWebhook(userId, id);
  await prisma.webhook.delete({ where: { id } });
}
