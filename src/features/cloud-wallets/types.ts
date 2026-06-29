import { type Network } from "@/generated/prisma/enums";

export interface CloudWalletBalance {
  assetType: string;
  assetCode: string;
  balance: string;
}

export interface CloudWalletDTO {
  id: string;
  name: string;
  network: Network;
  publicKey: string;
  funded: boolean;
  balances: CloudWalletBalance[];
  createdAt: string;
}

/** Returned only on create, exposing the secret seed once for backup. */
export interface CloudWalletWithSecretDTO extends CloudWalletDTO {
  secret: string;
}

export interface SendPaymentResult {
  hash: string;
}

export interface DestinationStatus {
  valid: boolean;
  exists: boolean | null;
  isSelf: boolean;
  network: Network;
}

export interface CloudWalletHistoryItem {
  id: string;
  type: string;
  direction: "in" | "out";
  amount: string;
  asset: string;
  counterparty: string;
  transactionHash: string;
  createdAt: string;
}
