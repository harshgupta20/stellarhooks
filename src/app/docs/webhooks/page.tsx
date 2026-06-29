import { type Metadata } from "next";

import { Zap, KeyRound, Send, RefreshCw, CheckCircle2 } from "lucide-react";

import { DocHeader, H2, H3, P, Bullets, C } from "@/features/docs/components/prose";
import { CodeBlock } from "@/features/docs/components/code-block";
import { CodeTabs } from "@/features/docs/components/code-tabs";
import { Callout } from "@/features/docs/components/callout";
import { ParamsTable } from "@/features/docs/components/params-table";
import { FlowDiagram } from "@/features/docs/components/flow-diagram";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Webhooks & events" };

const completedPayload = `{
  "event": "payment.completed",
  "productId": "prod_123",
  "paymentId": "pay_123",
  "amount": "25",
  "asset": "XLM",
  "wallet": "GABC...XYZ",
  "transactionHash": "f6afcc6b...",
  "status": "confirmed",
  "timestamp": "2026-01-01T00:00:00.000Z"
}`;

const receivedPayload = `{
  "id": "evt_123",
  "type": "payment.received",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "data": {
    "wallet": { "id": "wal_123", "address": "GABC...XYZ" },
    "amount": "25",
    "asset": "XLM",
    "from": "G...",
    "to": "GABC...XYZ",
    "transactionHash": "f6afcc6b..."
  }
}`;

const verifyTabs = [
  {
    label: "Node.js",
    code: `import crypto from "node:crypto";

// rawBody must be the exact bytes of the request body (not re-serialized JSON).
export function verifySignature(headers, rawBody, secret) {
  const signature = headers["x-stellarhooks-signature"];
  const timestamp = headers["x-stellarhooks-timestamp"];

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(\`\${timestamp}.\${rawBody}\`)
      .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}`,
  },
  {
    label: "Python",
    code: `import hashlib
import hmac

def verify_signature(headers, raw_body: str, secret: str) -> bool:
    signature = headers["x-stellarhooks-signature"]
    timestamp = headers["x-stellarhooks-timestamp"]

    expected = "sha256=" + hmac.new(
        secret.encode(),
        f"{timestamp}.{raw_body}".encode(),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)`,
  },
];

export default function WebhooksGuidePage() {
  return (
    <article className="space-y-10">
      <DocHeader
        title="Webhooks & events"
        description="Receive signed events on your server, verify them, and respond. Failed deliveries retry automatically."
      />

      <FlowDiagram
        nodes={[
          { icon: Zap, label: "Event", caption: "payment confirmed" },
          { icon: KeyRound, label: "Sign", caption: "HMAC-SHA256" },
          { icon: Send, label: "POST", caption: "to your URL", accent: true },
          { icon: RefreshCw, label: "Retry", caption: "on failure" },
          { icon: CheckCircle2, label: "2xx", caption: "acknowledged" },
        ]}
      />

      <section className="space-y-4">
        <H2 id="events">Event types</H2>
        <ParamsTable
          params={[
            {
              name: "payment.completed",
              type: "event",
              description: "A payment for one of your products was confirmed on-chain.",
            },
            {
              name: "payment.received",
              type: "event",
              description: "Any incoming payment to a monitored wallet (wallet-monitoring).",
            },
          ]}
        />
      </section>

      <section className="space-y-4">
        <H2 id="payloads">Payloads</H2>
        <H3>payment.completed</H3>
        <CodeBlock language="json" code={completedPayload} />
        <H3>payment.received</H3>
        <CodeBlock language="json" code={receivedPayload} />
      </section>

      <section className="space-y-4">
        <H2 id="headers">Delivery headers</H2>
        <ParamsTable
          params={[
            { name: "x-stellarhooks-event", type: "string", description: "The event type." },
            { name: "x-stellarhooks-delivery", type: "string", description: "Unique delivery id." },
            { name: "x-stellarhooks-timestamp", type: "string", description: "Unix ms timestamp used in the signature." },
            { name: "x-stellarhooks-signature", type: "string", description: <>HMAC signature, format <C>sha256=…</C>.</> },
          ]}
        />
      </section>

      <section className="space-y-4">
        <H2 id="verify">Verifying signatures</H2>
        <P>
          Compute <C>sha256 = HMAC_SHA256(secret, timestamp + &quot;.&quot; + rawBody)</C> and compare
          it to the <C>x-stellarhooks-signature</C> header using a constant-time comparison. Use the{" "}
          <strong className="text-foreground">raw request body</strong> — re-serializing the JSON
          will change the bytes and break verification.
        </P>
        <CodeTabs tabs={verifyTabs} />
      </section>

      <section className="space-y-4">
        <H2 id="retries">Responding & retries</H2>
        <Bullets
          items={[
            <>
              Return a <C>2xx</C> status quickly to acknowledge. Any non-2xx (or timeout) is treated
              as a failure.
            </>,
            <>
              Failed deliveries retry on a backoff schedule:{" "}
              <C>30s → 2m → 10m → 1h</C>, then the delivery is marked exhausted.
            </>,
            <>Every attempt is logged and can be replayed from the dashboard.</>,
            <>
              Deliveries can repeat — make your handler idempotent on{" "}
              <C>transactionHash</C> / <C>paymentId</C>.
            </>,
          ]}
        />
      </section>

      <Callout variant="tip">
        Build and test against a temporary endpoint (e.g. webhook.site) before pointing at
        production.
      </Callout>

      <DocsPager />
    </article>
  );
}
