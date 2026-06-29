import { type PaymentStatus } from "@/generated/prisma/enums";

export interface PaymentProductRef {
  id: string;
  name: string;
}

export interface PaymentDTO {
  id: string;
  status: PaymentStatus;
  amount: string;
  assetCode: string;
  assetIssuer: string | null;
  memo: string | null;
  senderAddress: string | null;
  receiverAddress: string;
  transactionHash: string;
  product: PaymentProductRef;
  paymentLinkId: string | null;
  createdAt: string;
}

export interface RevenueStats {
  paymentsConfirmed: number;
  paymentsPending: number;
  revenueByAsset: { asset: string; total: string }[];
}
