/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Package, Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { Logo } from "@/components/shared/logo";
import { formatAmount } from "@/lib/format";
import { type PublicPaymentLinkDTO } from "@/features/payment-links/types";

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2.5">
        <code className={mono ? "flex-1 break-all font-mono text-xs" : "flex-1 text-sm"}>
          {value}
        </code>
        <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
      </div>
    </div>
  );
}

export function PaymentPage({
  data,
  qrSvg,
}: {
  data: PublicPaymentLinkDTO;
  qrSvg: string;
}) {
  const { product } = data;
  const isFixed = product.priceType === "FIXED";
  const [amount, setAmount] = useState("");

  const displayAmount = isFixed
    ? formatAmount(product.price ?? "0")
    : amount
      ? formatAmount(amount)
      : product.minAmount
        ? `≥ ${formatAmount(product.minAmount)}`
        : "—";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 py-2">
          {/* product */}
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <Package className="size-6 text-muted-foreground" />
              )}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{product.name}</h1>
              {product.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
              )}
            </div>
            <Badge variant="secondary" className="ml-auto self-start">
              {data.network === "TESTNET" ? "Testnet" : "Stellar"}
            </Badge>
          </div>

          {/* amount */}
          <div className="rounded-xl border bg-muted/30 p-4 text-center">
            <p className="text-xs text-muted-foreground">Amount due</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {displayAmount}{" "}
              <span className="text-base font-normal text-muted-foreground">
                {product.assetCode}
              </span>
            </p>
            {!isFixed && (
              <div className="mx-auto mt-3 max-w-[12rem]">
                <Input
                  inputMode="decimal"
                  placeholder={product.minAmount ? `Min ${product.minAmount}` : "Enter amount"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-center"
                />
              </div>
            )}
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-xl border bg-white p-3 [&_svg]:size-44"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="text-xs text-muted-foreground">Scan with a Stellar wallet</p>
          </div>

          {/* details */}
          <div className="space-y-3">
            <Field label="Address" value={data.walletAddress} />
            <Field label="Memo" value={data.memo} />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs">
            <Info className="mt-0.5 size-3.5 shrink-0 text-warning" />
            <p className="text-muted-foreground">
              Include the <span className="font-medium">memo</span> exactly, or the payment can&apos;t
              be matched. It&apos;s detected automatically once it settles.
            </p>
          </div>
        </CardContent>
      </Card>

      <Logo />
    </div>
  );
}
