# StellarHooks

**Real-time webhook infrastructure for Stellar applications.**

Add a wallet, add a webhook URL, and receive payment events automatically. StellarHooks
handles polling, event detection, signed delivery, retries, and logging — so you don't have to
rebuild that for every project.

This is webhook infrastructure. It is **not** a blockchain explorer, wallet, or payment processor.

---

## Features

- **Authentication** — email + password (NextAuth v5, JWT sessions).
- **Wallets** — register Stellar addresses (testnet or public) to monitor. Full CRUD with
  StrKey address validation.
- **Webhooks** — register endpoints with a generated HMAC signing secret (revealed once,
  rotatable). Full CRUD.
- **Events** — incoming payments are detected and stored as `payment.received` events,
  deduplicated so a transaction is never processed twice.
- **Deliveries** — every delivery attempt is recorded with status, response code, response
  time, and attempt count. Failed deliveries retry on a backoff schedule and can be replayed
  manually.
- **Dashboard** — wallet/webhook counts, events today, and successful/failed delivery totals.
- **Cloud wallets (custodial)** — generate Stellar wallets in-app, view balances, fund on
  testnet (Friendbot), and send native XLM payments. Secret keys are encrypted at rest with
  AES-256-GCM and the secret is shown once on creation for backup. **Testnet-first;** holding
  keys is custody — for mainnet, move `WALLET_ENCRYPTION_KEY` into a KMS/secret manager.

## Tech stack

Next.js 16 (App Router) · TypeScript (strict) · TailwindCSS v4 · shadcn/ui · Neon Postgres ·
Prisma 7 · NextAuth v5 · Zod · React Hook Form · Lucide · pnpm.

## Architecture

```
External scheduler (every ~1–5 min)
  └─ POST /api/cron/poll      (Bearer CRON_SECRET)
       └─ for each ACTIVE wallet:
            fetch Horizon /accounts/{addr}/payments?cursor=<last>&order=asc
            → map incoming payments
            → create Event (dedupe on walletId + transactionHash)
            → fan out one Delivery per matching ACTIVE webhook
            → sign (HMAC-SHA256) + POST, record the attempt
            → advance the wallet cursor
  └─ POST /api/cron/retry     (Bearer CRON_SECRET)
       └─ re-attempt deliveries whose nextRetryAt is due
```

Idempotency is enforced two ways: each wallet stores `lastCursor` (Horizon `paging_token`) so
processed pages are never refetched, **and** a unique constraint on `(walletId, transactionHash)`
makes double-insertion impossible.

Layering: **Route Handler** (HTTP, Zod, auth guard) → **Service** (business logic) →
**Prisma** (data) / **HorizonClient** + **Dispatcher** (external I/O).

```
src/
  app/                     # routes: marketing, (auth), (dashboard), api/*
  features/                # wallets, webhooks, events, deliveries, auth, dashboard
    <feature>/{components,schemas,types}
  server/
    services/              # wallet/webhook/event/delivery/poll/stats/auth services
    blockchain/            # horizon-client, payment-mapper
    delivery/              # dispatcher (sign + POST), retry-policy
    auth/                  # NextAuth config + guards
    db/                    # Prisma singleton (pg driver adapter)
    http/                  # api-response, errors, cron-auth
  components/{ui,shared}   # shadcn primitives + reusable app components
  lib/                     # env, constants, hmac, stellar, format, pagination, api-client
prisma/schema.prisma
```

## Getting started

### 1. Prerequisites

- Node 20+ and pnpm (`corepack enable pnpm`)
- A [Neon](https://neon.tech) Postgres database (free tier)

### 2. Environment

`.env` is created for you with generated `AUTH_SECRET` and `CRON_SECRET`. Fill in your Neon
connection strings:

```dotenv
DATABASE_URL="postgresql://…@…-pooler.neon.tech/db?sslmode=require"  # pooled, app runtime
DIRECT_URL="postgresql://…@….neon.tech/db?sslmode=require"          # non-pooled, migrations
AUTH_SECRET="…"      # generate: openssl rand -base64 32
CRON_SECRET="…"      # generate: openssl rand -base64 32
WALLET_ENCRYPTION_KEY="…"  # 32-byte base64 key for custodial wallet secrets; openssl rand -base64 32
```

### 3. Database

```bash
pnpm db:migrate        # apply schema (uses DIRECT_URL)
pnpm db:generate       # regenerate Prisma client (also runs on build)
```

### 4. Develop

```bash
pnpm dev               # http://localhost:3000
```

Register an account, add a **testnet** wallet, then fund it with
[Friendbot](https://laboratory.stellar.org/#account-creator?network=test) to generate a real
`payment.received` event.

### 5. Run the poller locally

The poller is triggered by HTTP, so you can fire it by hand while developing:

```bash
curl -X POST http://localhost:3000/api/cron/poll  -H "Authorization: Bearer $CRON_SECRET"
curl -X POST http://localhost:3000/api/cron/retry -H "Authorization: Bearer $CRON_SECRET"
```

## Scheduling the poller (production)

Vercel Hobby cron only fires once per day, so polling is driven by a free external scheduler:

- **cron-job.org** (recommended, 1-minute granularity): create two jobs that `POST` to
  `https://<app>/api/cron/poll` and `/api/cron/retry`, each with header
  `Authorization: Bearer <CRON_SECRET>`.
- **GitHub Actions** (5-minute, best-effort): see [`.github/workflows/poll.yml`](.github/workflows/poll.yml).
  Add repo secrets `APP_URL` and `CRON_SECRET`.

## Webhook payload & verification

Each delivery is a `POST` with these headers:

| Header                     | Value                                            |
| -------------------------- | ------------------------------------------------ |
| `x-stellarhooks-signature` | `sha256=<hex hmac>` of `"{timestamp}.{rawBody}"` |
| `x-stellarhooks-timestamp` | unix epoch ms used in the signature              |
| `x-stellarhooks-event`     | e.g. `payment.received`                          |
| `x-stellarhooks-delivery`  | delivery id                                      |

Body:

```json
{
  "id": "evt_…",
  "type": "payment.received",
  "createdAt": "2026-06-26T12:00:00.000Z",
  "data": {
    "wallet": { "id": "wal_…", "address": "G…" },
    "amount": "10.0000000",
    "asset": "XLM",
    "from": "G…",
    "to": "G…",
    "transactionHash": "…"
  }
}
```

Verify it (Node):

```ts
import crypto from "node:crypto";

function verify(secret: string, timestamp: string, rawBody: string, header: string) {
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
}
```

> Use the **raw** request body (not the re-serialized JSON) when computing the signature.

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Set env vars: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `CRON_SECRET`
   (and `HORIZON_*` if overriding defaults).
3. Deploy. The build runs `prisma generate && next build`.
4. Configure the external scheduler (above) to hit `/api/cron/poll` and `/api/cron/retry`.

## Scripts

| Script                      | Description                          |
| --------------------------- | ------------------------------------ |
| `pnpm dev`                  | Start the dev server                 |
| `pnpm build`                | `prisma generate` + production build |
| `pnpm db:migrate`           | Apply migrations                     |
| `pnpm db:studio`            | Open Prisma Studio                   |
| `pnpm lint` / `pnpm format` | Lint / format                        |
