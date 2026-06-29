import { type DeliveryStatus } from "@/generated/prisma/enums";

export interface DeliveryDTO {
  id: string;
  status: DeliveryStatus;
  attempts: number;
  responseCode: number | null;
  responseTimeMs: number | null;
  nextRetryAt: string | null;
  lastError: string | null;
  createdAt: string;
  webhook: { id: string; name: string; url: string };
  event: {
    id: string;
    type: string;
    amount: string;
    asset: string;
    transactionHash: string;
  };
}
