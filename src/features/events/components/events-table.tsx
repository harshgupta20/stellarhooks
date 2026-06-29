import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatAmount } from "@/lib/format";
import { truncateAddress } from "@/lib/stellar";
import { type EventDTO, type EventDeliverySummary } from "@/features/events/types";

function DeliverySummaryBadge({ summary }: { summary: EventDeliverySummary }) {
  if (summary.total === 0) return <StatusBadge tone="neutral" label="No webhooks" />;
  if (summary.failed > 0) return <StatusBadge tone="failed" label={`${summary.failed} failed`} />;
  if (summary.pending > 0)
    return <StatusBadge tone="pending" label={`${summary.pending} pending`} />;
  return <StatusBadge tone="success" label="Delivered" />;
}

export function EventsTable({ events }: { events: EventDTO[] }) {
  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Delivery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {formatDateTime(event.createdAt)}
              </TableCell>
              <TableCell>
                <span className="font-medium">{event.wallet.name}</span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatAmount(event.amount)}
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs">{event.asset}</span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <code className="text-muted-foreground font-mono text-xs">
                    {truncateAddress(event.transactionHash, 6, 6)}
                  </code>
                  <CopyButton value={event.transactionHash} label="Copy transaction hash" />
                </span>
              </TableCell>
              <TableCell>
                <DeliverySummaryBadge summary={event.deliverySummary} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
