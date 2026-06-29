import { type Metadata } from "next";
import Link from "next/link";

import { DocHeader, H2, P, C } from "@/features/docs/components/prose";
import { Callout } from "@/features/docs/components/callout";
import { CodeBlock } from "@/features/docs/components/code-block";
import { CodeTabs } from "@/features/docs/components/code-tabs";
import { DocsPager } from "@/features/docs/components/docs-pager";

export const metadata: Metadata = { title: "Quickstart" };

const createProduct = [
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
const { data: product } = await res.json();`,
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
product = res.json()["data"]`,
  },
];

const createLink = [
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
console.log(link.url); // https://your-app.com/p/abc123`,
  },
];

export default function QuickstartPage() {
  return (
    <article className="space-y-8">
      <DocHeader
        title="Quickstart"
        description="Create your first product and payment link in a few minutes."
      />

      <div className="space-y-4">
        <H2 id="api-key">1. Get an API key</H2>
        <P>
          In the dashboard, open{" "}
          <Link href="/dashboard/api-keys" className="text-foreground underline">
            API Keys
          </Link>{" "}
          and create a key. It&apos;s shown once — store it as an environment variable.
        </P>
        <CodeBlock language="bash" code={`export STELLARHOOKS_API_KEY="sk_..."`} />
      </div>

      <div className="space-y-4">
        <H2 id="wallet">2. Add a wallet to receive into</H2>
        <P>
          Products receive payments into a monitored wallet. Add one in{" "}
          <Link href="/dashboard/wallets" className="text-foreground underline">
            Monitored Wallets
          </Link>{" "}
          (or via the API) and copy its id.
        </P>
        <CodeBlock
          language="bash"
          code={`curl https://your-app.com/api/v1/wallets \\
  -H "Authorization: Bearer $STELLARHOOKS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Treasury", "address": "G...", "network": "TESTNET" }'`}
        />
      </div>

      <div className="space-y-4">
        <H2 id="product">3. Create a product</H2>
        <P>
          Use the wallet id from the previous step as <C>walletId</C>.
        </P>
        <CodeTabs tabs={createProduct} />
      </div>

      <div className="space-y-4">
        <H2 id="link">4. Create a payment link</H2>
        <P>
          A link returns a hosted payment page URL you can share or embed. Each link gets a unique
          memo used to match incoming payments.
        </P>
        <CodeTabs tabs={createLink} />
      </div>

      <div className="space-y-4">
        <H2 id="webhook">5. Get notified when paid</H2>
        <P>
          Register a webhook subscribed to <C>payment.completed</C>. When a customer pays, we verify
          the payment on-chain and POST a signed event to your endpoint.
        </P>
        <Callout variant="info">
          See{" "}
          <Link href="/docs/webhooks">Webhooks &amp; events</Link> for the payload and how to verify
          signatures.
        </Callout>
      </div>

      <DocsPager />
    </article>
  );
}
