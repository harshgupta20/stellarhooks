import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime, formatAmount } from "@/lib/format";
import { DeliveryStatusBadge } from "@/features/deliveries/components/delivery-status-badge";
import { DeliveryReplayButton } from "@/features/deliveries/components/delivery-replay-button";
import { type DeliveryDTO } from "@/features/deliveries/types";

function ResponseCell({ delivery }: { delivery: DeliveryDTO }) {
  if (delivery.responseCode === null && delivery.lastError) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-destructive cursor-help text-sm underline decoration-dotted">
            Error
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{delivery.lastError}</TooltipContent>
      </Tooltip>
    );
  }
  if (delivery.responseCode === null) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  const ok = delivery.responseCode >= 200 && delivery.responseCode < 300;
  return (
    <span className="flex items-center gap-2 text-sm">
      <span className={ok ? "text-success" : "text-destructive"}>{delivery.responseCode}</span>
      {delivery.responseTimeMs !== null && (
        <span className="text-muted-foreground text-xs">{delivery.responseTimeMs}ms</span>
      )}
    </span>
  );
}

export function DeliveriesTable({ deliveries }: { deliveries: DeliveryDTO[] }) {
  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created</TableHead>
            <TableHead>Webhook</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Response</TableHead>
            <TableHead className="text-center">Attempts</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => {
            const canReplay = delivery.status === "FAILED" || delivery.status === "EXHAUSTED";
            return (
              <TableRow key={delivery.id}>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatDateTime(delivery.createdAt)}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{delivery.webhook.name}</span>
                  <code className="text-muted-foreground block max-w-[14rem] truncate font-mono text-xs">
                    {delivery.webhook.url}
                  </code>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatAmount(delivery.event.amount)}{" "}
                  <span className="text-muted-foreground font-mono text-xs">
                    {delivery.event.asset}
                  </span>
                </TableCell>
                <TableCell>
                  <DeliveryStatusBadge status={delivery.status} />
                </TableCell>
                <TableCell>
                  <ResponseCell delivery={delivery} />
                </TableCell>
                <TableCell className="text-center tabular-nums">{delivery.attempts}</TableCell>
                <TableCell>
                  {canReplay && <DeliveryReplayButton deliveryId={delivery.id} />}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
