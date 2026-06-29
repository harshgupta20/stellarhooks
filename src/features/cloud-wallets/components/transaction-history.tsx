import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { CopyButton } from "@/components/shared/copy-button";
import { cn } from "@/lib/utils";
import { formatDateTime, formatAmount } from "@/lib/format";
import { truncateAddress } from "@/lib/stellar";
import { type Network } from "@/generated/prisma/enums";
import { type CloudWalletHistoryItem } from "@/features/cloud-wallets/types";
import { History } from "lucide-react";

function explorerTxUrl(network: Network, hash: string): string {
  const net = network === "PUBLIC" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/tx/${hash}`;
}

export function TransactionHistory({
  items,
  network,
}: {
  items: CloudWalletHistoryItem[];
  network: Network;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No transactions yet"
        description="Payments to and from this wallet will appear here."
      />
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Counterparty</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const incoming = item.direction === "in";
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-medium",
                      incoming ? "text-success" : "text-foreground",
                    )}
                  >
                    {incoming ? (
                      <ArrowDownLeft className="size-4 text-success" />
                    ) : (
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    )}
                    {incoming ? "Received" : "Sent"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  <span className={incoming ? "text-success" : undefined}>
                    {incoming ? "+" : "−"}
                    {formatAmount(item.amount)}
                  </span>{" "}
                  <span className="font-mono text-xs text-muted-foreground">{item.asset}</span>
                </TableCell>
                <TableCell>
                  {item.counterparty ? (
                    <span className="flex items-center gap-1">
                      <code className="font-mono text-xs text-muted-foreground">
                        {truncateAddress(item.counterparty, 6, 6)}
                      </code>
                      <CopyButton value={item.counterparty} label="Copy address" />
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </TableCell>
                <TableCell>
                  <Link
                    href={explorerTxUrl(network, item.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="View on explorer"
                    title="View on explorer"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
