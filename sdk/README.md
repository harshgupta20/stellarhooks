# @stellarhooks/sdk

Fully-typed, promise-based, tree-shakeable TypeScript SDK for the **StellarHooks**
payments + webhooks platform.

```bash
npm install @stellarhooks/sdk
```

## Quick start

```ts
import { StellarPlatform } from "@stellarhooks/sdk";

const client = new StellarPlatform(process.env.STELLARHOOKS_API_KEY!, {
  baseUrl: "https://your-app.com", // defaults to http://localhost:3000
});
```

Create an API key in the dashboard under **API Keys**. It authenticates as
`Authorization: Bearer <key>`.

## Products

```ts
// Create
const product = await client.products.create({
  name: "Pro plan",
  walletId: "wal_…",          // a monitored wallet you own
  assetCode: "XLM",            // or "USDC" + assetIssuer
  priceType: "FIXED",
  price: "25",
});

// List (paginated, filterable, sortable)
const { data, meta } = await client.products.list({
  active: true,
  search: "pro",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
});

await client.products.get(product.id);
await client.products.update(product.id, { active: false });
await client.products.delete(product.id);
```

## Payment links

```ts
const link = await client.paymentLinks.create({ productId: product.id });
console.log(link.url); // https://your-app.com/p/abc123

await client.paymentLinks.list({ productId: product.id });
await client.paymentLinks.update(link.id, { active: false });
await client.paymentLinks.delete(link.id);
```

## Payments

```ts
const { data: payments } = await client.payments.list({ status: "CONFIRMED" });
const payment = await client.payments.get(payments[0].id);
```

## Wallets

```ts
const wallet = await client.wallets.watch({
  name: "Treasury",
  address: "G…",
  network: "TESTNET",
});
await client.wallets.list();
```

## Webhooks

```ts
const webhook = await client.webhooks.create({
  name: "Payments",
  url: "https://api.example.com/webhooks",
  events: ["payment.completed"],
});
console.log(webhook.secret); // shown once — store it to verify signatures
```

### The `payment.completed` event

```json
{
  "event": "payment.completed",
  "productId": "...",
  "paymentId": "...",
  "amount": "25",
  "asset": "USDC",
  "wallet": "...",
  "transactionHash": "...",
  "status": "confirmed",
  "timestamp": "..."
}
```

Verify the `x-stellarhooks-signature` header (HMAC-SHA256 of
`` `${timestamp}.${rawBody}` `` using the webhook secret).

## Error handling

Every non-2xx response throws a typed `StellarPlatformError`:

```ts
import { StellarPlatformError } from "@stellarhooks/sdk";

try {
  await client.products.get("missing");
} catch (err) {
  if (err instanceof StellarPlatformError) {
    console.error(err.status, err.code, err.message);
  }
}
```

## Design

- **Fully typed** — every request and response is typed end-to-end.
- **Promise-based** — `async/await` throughout.
- **Tree-shakeable** — ESM, `sideEffects: false`; bundlers drop unused resources.
- **Zero runtime deps** — uses the global `fetch` (override via `options.fetch`).
