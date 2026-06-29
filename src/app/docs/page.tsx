import { type Metadata } from "next";
import Link from "next/link";

import { Users, Link2, Globe, Webhook, Server } from "lucide-react";

import { DocHeader, H2, P, Bullets, C } from "@/features/docs/components/prose";
import { Callout } from "@/features/docs/components/callout";
import { CodeBlock } from "@/features/docs/components/code-block";
import { FlowDiagram } from "@/features/docs/components/flow-diagram";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Introduction" };

export default function DocsIntroPage() {
  return (
    <article className="space-y-8">
      <DocHeader
        title="Introduction"
        description="Accept Stellar payments and receive real-time webhooks over a plain REST API — integrate from any language, no package required."
      />

      <div className="space-y-4">
        <P>
          StellarHooks is non-custodial payment infrastructure for Stellar. You create products,
          generate hosted payment links, and we watch the chain and notify your server the moment a
          payment settles. <strong className="text-foreground">We never hold your funds</strong> —
          they go straight to your own wallet.
        </P>
      </div>

      <div className="space-y-4">
        <H2 id="architecture">At a glance</H2>
        <FlowDiagram
          nodes={[
            { icon: Users, label: "Customer", caption: "pays via link" },
            { icon: Link2, label: "Payment link", caption: "address + memo" },
            { icon: Globe, label: "Stellar", caption: "settles on-chain" },
            { icon: Webhook, label: "StellarHooks", caption: "detect + verify", accent: true },
            { icon: Server, label: "Your server", caption: "payment.completed" },
          ]}
        />
        <P>
          Funds flow customer → your wallet directly. StellarHooks only watches the chain and
          notifies you — it never sits in the money path.
        </P>
      </div>

      <div className="space-y-4">
        <H2 id="what-you-can-do">What you can do</H2>
        <Bullets
          items={[
            <>
              <strong className="text-foreground">Products</strong> — define what customers pay for
              (fixed price or customer-chosen amount).
            </>,
            <>
              <strong className="text-foreground">Payment links</strong> — hosted payment pages with
              a QR code, address, and memo.
            </>,
            <>
              <strong className="text-foreground">Payments</strong> — confirmed on-chain payments,
              verified and recorded automatically.
            </>,
            <>
              <strong className="text-foreground">Wallets</strong> — monitor any Stellar address for
              incoming payments.
            </>,
            <>
              <strong className="text-foreground">Webhooks</strong> — signed <C>payment.completed</C>{" "}
              and <C>payment.received</C> events with automatic retries.
            </>,
          ]}
        />
      </div>

      <div className="space-y-4">
        <H2 id="base-url">Base URL</H2>
        <P>All API requests are made to your deployment under the versioned base path:</P>
        <CodeBlock language="text" code="https://your-app.com/api/v1" />
        <P>
          Requests and responses are JSON. Every successful response is wrapped in an envelope with{" "}
          <C>data</C> (and <C>meta</C> for lists); errors return <C>error</C>.
        </P>
      </div>

      <Callout variant="tip">
        <strong className="text-foreground">No SDK install needed.</strong> The API is plain HTTP —
        call it with <C>curl</C>, <C>fetch</C>, Python <C>requests</C>, or any HTTP client. Every
        endpoint in these docs includes copy-paste examples.
      </Callout>

      <div className="space-y-4">
        <H2 id="next">Next steps</H2>
        <P>
          Head to the{" "}
          <Link href="/docs/quickstart" className="text-foreground underline">
            Quickstart
          </Link>{" "}
          to make your first request, or read{" "}
          <Link href="/docs/how-it-works" className="text-foreground underline">
            How it works
          </Link>{" "}
          to understand the payment lifecycle.
        </P>
      </div>

      <DocsPager />
    </article>
  );
}
