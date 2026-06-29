import "server-only";

import { headers } from "next/headers";

import { siteConfig } from "@/lib/site-config";

/**
 * The public base URL for building links (e.g. payment pages). Derived from the
 * incoming request host so it works on any deployed domain without config, and
 * falls back to the configured site URL (APP_URL / Vercel production URL)
 * outside request scope.
 */
export async function getAppBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const isLocal = host.startsWith("localhost") || host.startsWith("127.");
      const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // Not in a request scope — fall back to the configured URL.
  }
  return siteConfig.url;
}
