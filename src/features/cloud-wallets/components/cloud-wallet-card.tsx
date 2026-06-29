import Link from "next/link";
import { ArrowUpRight, Coins } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { truncateAddress } from "@/lib/stellar";
import { formatAmount } from "@/lib/format";
import { CloudWalletActions } from "@/features/cloud-wallets/components/cloud-wallet-actions";
import { type CloudWalletDTO } from "@/features/cloud-wallets/types";

export function CloudWalletCard({ wallet }: { wallet: CloudWalletDTO }) {
  const isTestnet = wallet.network === "TESTNET";

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0 space-y-1">
          <Link
            href={`/dashboard/cloud-wallets/${wallet.id}`}
            className="group flex items-center gap-1 font-medium hover:underline"
          >
            <span className="truncate">{wallet.name}</span>
            <ArrowUpRight className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <span className="flex items-center gap-1">
            <code className="font-mono text-xs text-muted-foreground">
              {truncateAddress(wallet.publicKey, 6, 6)}
            </code>
            <CopyButton value={wallet.publicKey} label="Copy public key" />
          </span>
        </div>
        <Badge variant="secondary">{isTestnet ? "Testnet" : "Public"}</Badge>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="rounded-lg border bg-muted/30 p-3">
          {wallet.funded && wallet.balances.length > 0 ? (
            <ul className="space-y-1">
              {wallet.balances.map((b) => (
                <li key={b.assetCode + b.assetType} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Coins className="size-3.5" />
                    {b.assetCode}
                  </span>
                  <span className="font-medium tabular-nums">{formatAmount(b.balance)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Not funded yet.
              {isTestnet ? " Use Fund to get testnet XLM." : " Send XLM to this address to fund it."}
            </p>
          )}
        </div>

        <div className="mt-auto">
          <CloudWalletActions wallet={wallet} />
        </div>
      </CardContent>
    </Card>
  );
}
