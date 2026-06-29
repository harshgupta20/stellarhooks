import { type Metadata } from "next";

import { DocHeader, H2, P, C } from "@/features/docs/components/prose";
import { Endpoint } from "@/features/docs/components/endpoint";
import { ParamsTable } from "@/features/docs/components/params-table";
import { CodeBlock } from "@/features/docs/components/code-block";
import { CodeTabs } from "@/features/docs/components/code-tabs";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Products API" };

const createTabs = [
  {
    label: "cURL",
    code: `curl https://your-app.com/api/v1/products \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Pro plan",
    "walletId": "WALLET_ID",
    "assetCode": "XLM",
    "priceType": "FIXED",
    "price": "25"
  }'`,
  },
  {
    label: "JavaScript",
    code: `const res = await fetch("https://your-app.com/api/v1/products", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.STELLARHOOKS_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Pro plan",
    walletId: "WALLET_ID",
    assetCode: "XLM",
    priceType: "FIXED",
    price: "25",
  }),
});
const { data } = await res.json();`,
  },
  {
    label: "Python",
    code: `import os, requests

res = requests.post(
    "https://your-app.com/api/v1/products",
    headers={"Authorization": f"Bearer {os.environ['STELLARHOOKS_API_KEY']}"},
    json={
        "name": "Pro plan",
        "walletId": "WALLET_ID",
        "assetCode": "XLM",
        "priceType": "FIXED",
        "price": "25",
    },
)
data = res.json()["data"]`,
  },
];

const productJson = `{
  "data": {
    "id": "prod_123",
    "name": "Pro plan",
    "description": null,
    "imageUrl": null,
    "assetCode": "XLM",
    "assetIssuer": null,
    "priceType": "FIXED",
    "price": "25",
    "minAmount": null,
    "active": true,
    "wallet": { "id": "wal_123", "name": "Treasury", "address": "G...", "network": "TESTNET" },
    "paymentLinkCount": 0,
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "error": null
}`;

export default function ProductsApiPage() {
  return (
    <article className="space-y-10">
      <DocHeader
        title="Products"
        description="Define what customers pay for. A product belongs to a wallet and has a price."
      />

      <section className="space-y-4">
        <H2 id="object">The product object</H2>
        <ParamsTable
          params={[
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "name", type: "string", description: "Display name." },
            { name: "description", type: "string | null", description: "Optional description." },
            { name: "imageUrl", type: "string | null", description: "Optional image URL." },
            { name: "assetCode", type: "string", description: <>Asset code, e.g. <C>XLM</C> or <C>USDC</C>.</> },
            { name: "assetIssuer", type: "string | null", description: "Issuer for non-native assets." },
            { name: "priceType", type: '"FIXED" | "CUSTOM"', description: "Fixed price or customer-chosen." },
            { name: "price", type: "string | null", description: "Price for fixed-price products." },
            { name: "minAmount", type: "string | null", description: "Minimum for custom products." },
            { name: "active", type: "boolean", description: "Inactive products reject payments." },
            { name: "wallet", type: "object", description: "The receiving wallet (id, name, address, network)." },
            { name: "paymentLinkCount", type: "number", description: "Number of payment links." },
            { name: "createdAt", type: "string", description: "ISO 8601 timestamp." },
          ]}
        />
      </section>

      <section className="space-y-4">
        <H2 id="create">Create a product</H2>
        <Endpoint method="POST" path="/api/v1/products" />
        <ParamsTable
          params={[
            { name: "name", type: "string", required: true, description: "Display name." },
            { name: "walletId", type: "string", required: true, description: "A monitored wallet you own." },
            { name: "assetCode", type: "string", required: true, description: <>Use <C>XLM</C> or a custom code.</> },
            { name: "priceType", type: '"FIXED" | "CUSTOM"', required: true, description: "Pricing model." },
            { name: "price", type: "string", description: <>Required when <C>priceType</C> is <C>FIXED</C>.</> },
            { name: "minAmount", type: "string", description: <>Optional minimum for <C>CUSTOM</C>.</> },
            { name: "assetIssuer", type: "string", description: "Required for non-XLM assets." },
            { name: "description", type: "string", description: "Optional." },
            { name: "imageUrl", type: "string", description: "Optional image URL." },
            { name: "active", type: "boolean", description: "Defaults to true." },
          ]}
        />
        <CodeTabs tabs={createTabs} />
        <P>Returns the created product:</P>
        <CodeBlock language="json" code={productJson} />
      </section>

      <section className="space-y-4">
        <H2 id="list">List products</H2>
        <Endpoint method="GET" path="/api/v1/products" />
        <ParamsTable
          params={[
            { name: "page", type: "number", description: "Page number (default 1)." },
            { name: "pageSize", type: "number", description: "Items per page (max 100)." },
            { name: "active", type: "boolean", description: "Filter by active state." },
            { name: "search", type: "string", description: "Filter by name." },
            { name: "sortBy", type: '"createdAt" | "name"', description: "Sort field." },
            { name: "sortOrder", type: '"asc" | "desc"', description: "Sort direction." },
          ]}
        />
        <CodeBlock
          language="bash"
          code={`curl "https://your-app.com/api/v1/products?active=true&sortBy=name&page=1" \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY"`}
        />
        <P>
          Returns <C>{`{ data: Product[], meta: { page, pageSize, total, totalPages } }`}</C>.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="retrieve">Retrieve, update, delete</H2>
        <Endpoint method="GET" path="/api/v1/products/{id}" />
        <Endpoint method="PATCH" path="/api/v1/products/{id}" />
        <Endpoint method="DELETE" path="/api/v1/products/{id}" />
        <P>
          <C>PATCH</C> accepts the same fields as create (all optional). <C>DELETE</C> removes a
          product and its links — products with payment history cannot be deleted; deactivate them
          instead.
        </P>
        <CodeBlock
          language="bash"
          code={`curl -X PATCH https://your-app.com/api/v1/products/PRODUCT_ID \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "active": false }'`}
        />
      </section>

      <DocsPager />
    </article>
  );
}
