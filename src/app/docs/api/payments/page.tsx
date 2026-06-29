import { type Metadata } from "next";

import { DocHeader, H2, P, C } from "@/features/docs/components/prose";
import { Endpoint } from "@/features/docs/components/endpoint";
import { ParamsTable } from "@/features/docs/components/params-table";
import { CodeBlock } from "@/features/docs/components/code-block";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Payments API" };

const paymentJson = `{
  "data": {
    "id": "pay_123",
    "status": "CONFIRMED",
    "amount": "25",
    "assetCode": "XLM",
    "assetIssuer": null,
    "memo": "abc123xyz0",
    "senderAddress": "G...",
    "receiverAddress": "G...",
    "transactionHash": "f6afcc6b...",
    "product": { "id": "prod_123", "name": "Pro plan" },
    "paymentLinkId": "plink_123",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "error": null
}`;

export default function PaymentsApiPage() {
  return (
    <article className="space-y-10">
      <DocHeader
        title="Payments"
        description="Read-only records of on-chain payments matched to your products. Created automatically on detection."
      />

      <section className="space-y-4">
        <H2 id="object">The payment object</H2>
        <ParamsTable
          params={[
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "status", type: '"PENDING" | "CONFIRMED" | "FAILED"', description: "Lifecycle status." },
            { name: "amount", type: "string", description: "Amount actually paid." },
            { name: "assetCode", type: "string", description: "Asset paid." },
            { name: "assetIssuer", type: "string | null", description: "Issuer for non-native assets." },
            { name: "memo", type: "string | null", description: "Memo on the transaction." },
            { name: "senderAddress", type: "string | null", description: "Payer address." },
            { name: "receiverAddress", type: "string", description: "Your wallet address." },
            { name: "transactionHash", type: "string", description: "Stellar transaction hash." },
            { name: "product", type: "object", description: "The product paid for (id, name)." },
            { name: "paymentLinkId", type: "string | null", description: "Originating payment link." },
            { name: "createdAt", type: "string", description: "ISO 8601 timestamp." },
          ]}
        />
        <P>
          <C>CONFIRMED</C> means the payment passed verification (a <C>payment.completed</C> webhook
          was fired). <C>FAILED</C> means a matched payment did not satisfy the asset/amount checks.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="list">List payments</H2>
        <Endpoint method="GET" path="/api/v1/payments" />
        <ParamsTable
          params={[
            { name: "status", type: '"PENDING" | "CONFIRMED" | "FAILED"', description: "Filter by status." },
            { name: "productId", type: "string", description: "Filter by product." },
            { name: "sortOrder", type: '"asc" | "desc"', description: "Sort by date (default desc)." },
            { name: "page", type: "number", description: "Page number." },
            { name: "pageSize", type: "number", description: "Items per page (max 100)." },
          ]}
        />
        <CodeBlock
          language="bash"
          code={`curl "https://your-app.com/api/v1/payments?status=CONFIRMED" \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY"`}
        />
      </section>

      <section className="space-y-4">
        <H2 id="retrieve">Retrieve a payment</H2>
        <Endpoint method="GET" path="/api/v1/payments/{id}" />
        <CodeBlock language="json" code={paymentJson} />
      </section>

      <DocsPager />
    </article>
  );
}
