import { type Metadata } from "next";
import Link from "next/link";

import { CreditCard, Search, Tag, ShieldCheck, Send } from "lucide-react";

import { DocHeader, H2, P, Bullets, C } from "@/features/docs/components/prose";
import { Callout } from "@/features/docs/components/callout";
import { FlowDiagram } from "@/features/docs/components/flow-diagram";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <article className="space-y-8">
      <DocHeader
        title="How it works"
        description="The objects involved and the lifecycle of a payment, end to end."
      />

      <div className="space-y-4">
        <H2 id="objects">Core objects</H2>
        <Bullets
          items={[
            <>
              <strong className="text-foreground">Wallet</strong> — a Stellar address you own that we
              monitor for incoming payments.
            </>,
            <>
              <strong className="text-foreground">Product</strong> — what a customer pays for, tied to
              a wallet, an asset, and a price (fixed or customer-chosen).
            </>,
            <>
              <strong className="text-foreground">Payment link</strong> — a hosted page for a product
              with a unique <C>memo</C> used to match payments.
            </>,
            <>
              <strong className="text-foreground">Payment</strong> — a confirmed on-chain payment
              recorded against a product.
            </>,
            <>
              <strong className="text-foreground">Webhook</strong> — your endpoint that receives signed
              events.
            </>,
          ]}
        />
      </div>

      <div className="space-y-4">
        <H2 id="lifecycle">Payment lifecycle</H2>
        <FlowDiagram
          nodes={[
            { icon: CreditCard, label: "Pay", caption: "with memo" },
            { icon: Search, label: "Detect", caption: "poll Horizon" },
            { icon: Tag, label: "Match", caption: "by memo" },
            { icon: ShieldCheck, label: "Verify", caption: "asset + amount", accent: true },
            { icon: Send, label: "Notify", caption: "payment.completed" },
          ]}
        />
        <P>
          When a customer opens a payment link, they send a normal Stellar payment to your wallet
          address, <strong className="text-foreground">including the memo</strong> shown on the page.
          From there:
        </P>
        <ol className="ml-1 space-y-3">
          {[
            <>
              We continuously poll Stellar Horizon for incoming payments to your monitored wallets.
            </>,
            <>
              Each incoming payment is matched to a payment link by its <C>memo</C>.
            </>,
            <>
              We verify the wallet, asset, and amount (for fixed-price products), then record a{" "}
              <C>Payment</C> as <C>PENDING</C> → <C>CONFIRMED</C>.
            </>,
            <>
              A signed <C>payment.completed</C> webhook is delivered to your endpoint, with automatic
              retries on failure.
            </>,
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-7 text-muted-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <Callout variant="warn">
        Because payments are matched by memo, customers must include the memo exactly. The hosted
        payment page makes this automatic (QR + copy), so prefer payment links over sharing a raw
        address.
      </Callout>

      <div className="space-y-4">
        <H2 id="verification">Matching &amp; verification</H2>
        <Bullets
          items={[
            <>
              <strong className="text-foreground">Wallet</strong> — the payment must arrive at the
              product&apos;s configured wallet.
            </>,
            <>
              <strong className="text-foreground">Asset</strong> — asset code (and issuer for non-XLM)
              must match the product.
            </>,
            <>
              <strong className="text-foreground">Amount</strong> — fixed-price products require at
              least the price; custom products accept any amount above the optional minimum.
            </>,
            <>
              <strong className="text-foreground">Idempotency</strong> — each transaction is recorded
              at most once.
            </>,
          ]}
        />
      </div>

      <Callout variant="tip">
        <strong className="text-foreground">Non-custodial.</strong> Funds never touch StellarHooks —
        they settle directly into your wallet. We only generate payment requests and verify them
        on-chain.
      </Callout>

      <div className="space-y-4">
        <H2 id="next">Next</H2>
        <P>
          Explore the{" "}
          <Link href="/docs/api/products" className="text-foreground underline">
            API reference
          </Link>{" "}
          to start building.
        </P>
      </div>

      <DocsPager />
    </article>
  );
}
