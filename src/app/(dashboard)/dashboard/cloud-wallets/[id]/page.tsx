import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coins, Wallet } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getCloudWalletDetail } from "@/server/services/cloud-wallet-service";
import { ApiError } from "@/server/http/errors";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { RefreshButton } from "@/components/shared/refresh-button";
import { formatAmount } from "@/lib/format";
import { CloudWalletActions } from "@/features/cloud-wallets/components/cloud-wallet-actions";
import { TransactionHistory } from "@/features/cloud-wallets/components/transaction-history";

export const metadata: Metadata = { title: "Cloud Wallet — StellarHooks" };

export default async function CloudWalletDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  let detail;
  try {
    detail = await getCloudWalletDetail(user.id, id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const { wallet, history } = detail;
  const isTestnet = wallet.network === "TESTNET";
  const nativeBalance = wallet.balances.find((b) => b.assetType === "native");

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/cloud-wallets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Cloud Wallets
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{wallet.name}</h1>
            <Badge variant="secondary">{isTestnet ? "Testnet" : "Public"}</Badge>
          </div>
          <span className="flex items-center gap-1">
            <code className="font-mono text-xs text-muted-foreground">{wallet.publicKey}</code>
            <CopyButton value={wallet.publicKey} label="Copy public key" />
          </span>
        </div>
        <RefreshButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="space-y-1 py-1">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Coins className="size-4" /> Balance
            </p>
            {wallet.funded ? (
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {formatAmount(nativeBalance?.balance ?? "0")}{" "}
                <span className="text-base font-normal text-muted-foreground">XLM</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not funded yet.{" "}
                {isTestnet ? "Use Fund to get testnet XLM." : "Send XLM to this address to fund it."}
              </p>
            )}
            {wallet.balances.filter((b) => b.assetType !== "native").length > 0 && (
              <ul className="pt-2 text-sm">
                {wallet.balances
                  .filter((b) => b.assetType !== "native")
                  .map((b) => (
                    <li key={b.assetCode} className="flex justify-between">
                      <span className="text-muted-foreground">{b.assetCode}</span>
                      <span className="tabular-nums">{formatAmount(b.balance)}</span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="flex h-full flex-col justify-between gap-4 py-1">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Wallet className="mt-0.5 size-4 shrink-0" />
              <p>
                Share the public key above to <span className="font-medium">receive</span>{" "}
                payments. Use the actions to fund{isTestnet ? " (testnet)" : ""}, send, or delete
                this wallet.
              </p>
            </div>
            <CloudWalletActions wallet={wallet} afterDelete="redirect" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Transaction history</h2>
        <TransactionHistory items={history} network={wallet.network} />
      </div>
    </div>
  );
}
