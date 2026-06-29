import { type Network, type WalletStatus } from "@/generated/prisma/enums";

export interface WalletDTO {
  id: string;
  name: string;
  address: string;
  network: Network;
  status: WalletStatus;
  lastSyncAt: string | null;
  createdAt: string;
}
