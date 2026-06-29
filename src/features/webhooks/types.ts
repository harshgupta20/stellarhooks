import { type WebhookStatus, type Network } from "@/generated/prisma/enums";
import { type EventType } from "@/lib/constants";

export interface WebhookDTO {
  id: string;
  name: string;
  url: string;
  events: EventType[];
  network: Network;
  status: WebhookStatus;
  secretMasked: string;
  createdAt: string;
}

/** Returned only on create / rotate, exposing the full signing secret once. */
export interface WebhookWithSecretDTO extends WebhookDTO {
  secret: string;
}
