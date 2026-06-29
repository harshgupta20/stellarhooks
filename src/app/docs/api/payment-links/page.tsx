import { type Metadata } from "next";

import { DocHeader, H2, P, C } from "@/features/docs/components/prose";
import { Endpoint } from "@/features/docs/components/endpoint";
import { ParamsTable } from "@/features/docs/components/params-table";
import { CodeBlock } from "@/features/docs/components/code-block";
import { CodeTabs } from "@/features/docs/components/code-tabs";
import { Callout } from "@/features/docs/components/callout";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Payment links API" };

const createTabs = [
  {
    label: "cURL",
    code: `curl https://your-app.com/api/v1/payment-links \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "productId": "PRODUCT_ID" }'`,
  },
  {
    label: "JavaScript",
    code: `const res = await fetch("https://your-app.com/api/v1/payment-links", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.STELLARHOOKS_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ productId: "PRODUCT_ID" }),
});
const { data: link } = await res.json();
console.log(link.url, link.memo);`,
  },
];

const linkJson = `{
  "data": {
    "id": "plink_123",
    "slug": "abc123xyz0",
    "memo": "abc123xyz0",
    "url": "https://your-app.com/p/abc123xyz0",
    "active": true,
    "paymentCount": 0,
    "product": { "id": "prod_123", "name": "Pro plan", "assetCode": "XLM", "priceType": "FIXED", "price": "25" },
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "error": null
}`;

export default function PaymentLinksApiPage() {
  return (
    <article className="space-y-10">
      <DocHeader
        title="Payment links"
        description="Hosted payment pages for a product. Each link carries a unique memo used to match payments."
      />

      <Callout variant="info">
        The hosted page lives at <C>url</C> (e.g. <C>/p/abc123xyz0</C>) and shows the product, amount,
        a QR code, the receiving address, and the memo. Share this with customers.
      </Callout>

      <section className="space-y-4">
        <H2 id="object">The payment link object</H2>
        <ParamsTable
          params={[
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "slug", type: "string", description: "URL slug for the hosted page." },
            { name: "memo", type: "string", description: "Stellar text memo used to match payments." },
            { name: "url", type: "string", description: "Full hosted payment page URL." },
            { name: "active", type: "boolean", description: "Inactive links reject payments." },
            { name: "paymentCount", type: "number", description: "Payments received via this link." },
            { name: "product", type: "object", description: "Summary of the linked product." },
            { name: "createdAt", type: "string", description: "ISO 8601 timestamp." },
          ]}
        />
      </section>

      <section className="space-y-4">
        <H2 id="create">Create a payment link</H2>
        <Endpoint method="POST" path="/api/v1/payment-links" />
        <ParamsTable
          params={[
            { name: "productId", type: "string", required: true, description: "Product to create a link for." },
          ]}
        />
        <CodeTabs tabs={createTabs} />
        <CodeBlock language="json" code={linkJson} />
      </section>

      <section className="space-y-4">
        <H2 id="list">List, update, delete</H2>
        <Endpoint method="GET" path="/api/v1/payment-links" />
        <Endpoint method="PATCH" path="/api/v1/payment-links/{id}" />
        <Endpoint method="DELETE" path="/api/v1/payment-links/{id}" />
        <P>
          List accepts <C>productId</C> and <C>active</C> filters plus <C>page</C>/<C>pageSize</C>.{" "}
          <C>PATCH</C> toggles <C>active</C>.
        </P>
        <CodeBlock
          language="bash"
          code={`curl -X PATCH https://your-app.com/api/v1/payment-links/LINK_ID \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "active": false }'`}
        />
      </section>

      <DocsPager />
    </article>
  );
}
