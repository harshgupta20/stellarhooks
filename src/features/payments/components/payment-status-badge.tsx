import { StatusBadge } from "@/components/shared/status-badge";
import { type PaymentStatus } from "@/generated/prisma/enums";

const MAP: Record<PaymentStatus, { tone: "success" | "pending" | "failed"; label: string }> = {
  CONFIRMED: { tone: "success", label: "Confirmed" },
  PENDING: { tone: "pending", label: "Pending" },
  FAILED: { tone: "failed", label: "Failed" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { tone, label } = MAP[status];
  return <StatusBadge tone={tone} label={label} />;
}
