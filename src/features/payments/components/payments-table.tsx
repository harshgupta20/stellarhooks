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
import { formatDateTime, formatAmount } from "@/lib/format";
import { truncateAddress } from "@/lib/stellar";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { type PaymentDTO } from "@/features/payments/types";

export function PaymentsTable({
  payments,
  showProduct = true,
}: {
  payments: PaymentDTO[];
  showProduct?: boolean;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {showProduct && <TableHead>Product</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {formatDateTime(p.createdAt)}
              </TableCell>
              {showProduct && <TableCell className="font-medium">{p.product.name}</TableCell>}
              <TableCell className="text-right font-medium tabular-nums">
                {formatAmount(p.amount)}{" "}
                <span className="font-mono text-xs text-muted-foreground">{p.assetCode}</span>
              </TableCell>
              <TableCell>
                {p.senderAddress ? (
                  <code className="font-mono text-xs text-muted-foreground">
                    {truncateAddress(p.senderAddress, 4, 4)}
                  </code>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <code className="font-mono text-xs text-muted-foreground">
                    {truncateAddress(p.transactionHash, 6, 6)}
                  </code>
                  <CopyButton value={p.transactionHash} label="Copy transaction hash" />
                </span>
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={p.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
