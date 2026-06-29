import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { WebhookRowActions } from "@/features/webhooks/components/webhook-row-actions";
import { type WebhookDTO } from "@/features/webhooks/types";

export function WebhooksTable({ webhooks }: { webhooks: WebhookDTO[] }) {
  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Events</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhooks.map((webhook) => (
            <TableRow key={webhook.id}>
              <TableCell className="font-medium">{webhook.name}</TableCell>
              <TableCell className="max-w-xs">
                <code className="text-muted-foreground block truncate font-mono text-xs">
                  {webhook.url}
                </code>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((e) => (
                    <Badge key={e} variant="secondary" className="font-mono text-xs">
                      {e}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge
                  tone={webhook.status === "ACTIVE" ? "active" : "paused"}
                  label={webhook.status === "ACTIVE" ? "Active" : "Paused"}
                />
              </TableCell>
              <TableCell>
                <WebhookRowActions webhook={webhook} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
