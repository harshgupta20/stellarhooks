import { type Network } from "@/generated/prisma/enums";

export interface ApiKeyDTO {
  id: string;
  name: string;
  prefix: string;
  network: Network;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiKeyWithSecret extends ApiKeyDTO {
  key: string;
}
