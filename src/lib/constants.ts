/** Shared application constants. */

export const APP_NAME = "StellarHooks";

/** Supported webhook event types. */
export const EVENT_TYPES = ["payment.received", "payment.completed"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Native Stellar asset code. */
export const NATIVE_ASSET = "XLM";

/** Price models for a product. */
export const PRICE_TYPES = ["FIXED", "CUSTOM"] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

/** Payment record statuses. */
export const PAYMENT_STATUSES = ["PENDING", "CONFIRMED", "FAILED"] as const;
export type PaymentStatusType = (typeof PAYMENT_STATUSES)[number];

/** Stellar networks a wallet can watch. */
export const NETWORKS = ["TESTNET", "PUBLIC"] as const;
export type Network = (typeof NETWORKS)[number];

export const DEFAULT_NETWORK: Network = "TESTNET";

/**
 * Retry backoff schedule (in seconds from the previous attempt) for failed
 * webhook deliveries. attempts=1 is the initial send; index 0 is the wait
 * before attempt 2, and so on. After the schedule is exhausted the delivery
 * is marked EXHAUSTED.
 */
export const RETRY_BACKOFF_SECONDS = [30, 120, 600, 3600] as const;
export const MAX_DELIVERY_ATTEMPTS = RETRY_BACKOFF_SECONDS.length + 1;

/** Webhook HTTP request timeout. */
export const WEBHOOK_TIMEOUT_MS = 10_000;

/** Signature + metadata header names sent with every webhook. */
export const WEBHOOK_HEADERS = {
  signature: "x-stellarhooks-signature",
  event: "x-stellarhooks-event",
  delivery: "x-stellarhooks-delivery",
  timestamp: "x-stellarhooks-timestamp",
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

/** Pre-defined tags for community questions. */
export const COMMUNITY_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "payments", label: "Payments" },
  { value: "webhooks", label: "Webhooks" },
  { value: "wallets", label: "Wallets" },
  { value: "api", label: "API & SDK" },
  { value: "billing", label: "Billing & plans" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature request" },
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number]["value"];
export const COMMUNITY_CATEGORY_VALUES = COMMUNITY_CATEGORIES.map((c) => c.value) as [
  CommunityCategory,
  ...CommunityCategory[],
];

export function communityCategoryLabel(value: string): string {
  return COMMUNITY_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/** Subscription tiers (ascending capability). */
export const PLANS = ["FREE", "PRO", "SCALE"] as const;
export type PlanTier = (typeof PLANS)[number];

export const PLAN_LABELS: Record<PlanTier, string> = {
  FREE: "Free",
  PRO: "Pro",
  SCALE: "Scale Startup",
};

export type PlanLimitResource = "wallets" | "webhooks" | "products" | "cloudWallets";

export const PLAN_RESOURCES: PlanLimitResource[] = [
  "wallets",
  "webhooks",
  "products",
  "cloudWallets",
];

/**
 * Default resource caps per plan, used as the seed/fallback when no admin-set
 * value exists in the database. -1 means unlimited.
 */
export const DEFAULT_PLAN_LIMITS: Record<PlanTier, Record<PlanLimitResource, number>> = {
  FREE: { wallets: 3, webhooks: 2, products: 10, cloudWallets: 2 },
  PRO: { wallets: 25, webhooks: 25, products: 200, cloudWallets: 25 },
  SCALE: { wallets: -1, webhooks: -1, products: -1, cloudWallets: -1 },
};

export const RESOURCE_LABELS: Record<PlanLimitResource, string> = {
  wallets: "monitored wallets",
  webhooks: "webhooks",
  products: "products",
  cloudWallets: "cloud wallets",
};

export function isUnlimited(limit: number): boolean {
  return limit < 0;
}

export function formatLimit(limit: number): string {
  return limit < 0 ? "Unlimited" : String(limit);
}

/**
 * Rate limits (fixed window). Lenient by design — they only block abuse.
 * API limits are per API key / user; the hosted payment page is per IP and
 * intentionally high so it can serve a very large audience.
 */
export const RATE_LIMITS = {
  api: { limit: 120, windowMs: 60_000 }, // 120 req/min per key
  paymentPage: { limit: 240, windowMs: 60_000 }, // 240 req/min per IP
} as const;
