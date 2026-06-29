/**
 * Centralized site metadata used for SEO, social cards, sitemap, robots,
 * the web app manifest, and JSON-LD structured data.
 *
 * The canonical public URL is read from APP_URL (the same value used to build
 * hosted payment links) and falls back to localhost for local development.
 */

import { APP_NAME } from "@/lib/constants";

function resolveSiteUrl(): string {
  const raw =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ??
    "http://localhost:3000";
  // Strip any trailing slash so we can safely concatenate paths.
  return raw.replace(/\/+$/, "");
}

export const siteConfig = {
  name: APP_NAME,
  /** Short tagline used in titles and the manifest. */
  tagline: "Accept Stellar payments & real-time webhooks",
  url: resolveSiteUrl(),
  description:
    "Accept Stellar payments with hosted payment links and receive signed webhooks the instant a payment settles. Non-custodial. No polling, retries, or checkout to build yourself.",
  /** Used for theme-color and OG image accents. */
  themeColor: "#0b0b0f",
  locale: "en_US",
  keywords: [
    "Stellar payments",
    "Stellar webhooks",
    "accept XLM payments",
    "crypto payment links",
    "Stellar API",
    "blockchain payments",
    "non-custodial payments",
    "payment webhooks",
    "Stellar Horizon",
    "USDC payments",
    "Stellar SDK",
    "developer payments infrastructure",
  ],
  twitter: "@stellarhooks",
  contactEmail: "edusystempro2@gmail.com",
  social: {
    twitter: "https://x.com/",
    linkedin: "https://www.linkedin.com/",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper for canonical links, OG images, and sitemaps. */
export function absoluteUrl(path = ""): string {
  if (!path) return siteConfig.url;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
