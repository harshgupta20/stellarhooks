import { type Network } from "@/generated/prisma/enums";

export interface EventDeliverySummary {
  total: number;
  success: number;
  pending: number;
  failed: number;
}

export interface EventDTO {
  id: string;
  type: string;
  amount: string;
  asset: string;
  fromAddress: string;
  toAddress: string;
  transactionHash: string;
  createdAt: string;
  wallet: {
    id: string;
    name: string;
    address: string;
    network: Network;
  };
  deliverySummary: EventDeliverySummary;
}
