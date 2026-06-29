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
import { CopyButton } from "@/components/shared/copy-button";
import { formatRelativeTime } from "@/lib/format";
import { truncateAddress } from "@/lib/stellar";
import { WalletRowActions } from "@/features/wallets/components/wallet-row-actions";
import { type WalletDTO } from "@/features/wallets/types";

export function WalletsTable({ wallets }: { wallets: WalletDTO[] }) {
  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Network</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last sync</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.map((wallet) => (
            <TableRow key={wallet.id}>
              <TableCell className="font-medium">{wallet.name}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <code className="text-muted-foreground font-mono text-xs">
                    {truncateAddress(wallet.address, 6, 6)}
                  </code>
                  <CopyButton value={wallet.address} label="Copy address" />
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {wallet.network === "TESTNET" ? "Testnet" : "Public"}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusBadge
                  tone={wallet.status === "ACTIVE" ? "active" : "paused"}
                  label={wallet.status === "ACTIVE" ? "Active" : "Paused"}
                />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatRelativeTime(wallet.lastSyncAt)}
              </TableCell>
              <TableCell>
                <WalletRowActions wallet={wallet} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
