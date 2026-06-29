import { StatusBadge } from "@/components/shared/status-badge";
import { type DeliveryStatus } from "@/generated/prisma/enums";

const MAP: Record<DeliveryStatus, { tone: "success" | "pending" | "failed"; label: string }> = {
  SUCCESS: { tone: "success", label: "Delivered" },
  PENDING: { tone: "pending", label: "Pending" },
  FAILED: { tone: "pending", label: "Retrying" },
  EXHAUSTED: { tone: "failed", label: "Failed" },
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const { tone, label } = MAP[status];
  return <StatusBadge tone={tone} label={label} />;
}
