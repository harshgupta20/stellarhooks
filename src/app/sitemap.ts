import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-config";

/** Publicly indexable, statically-known routes. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/docs", priority: 0.8, changeFrequency: "weekly" },
  { path: "/docs/quickstart", priority: 0.7, changeFrequency: "monthly" },
  { path: "/docs/how-it-works", priority: 0.6, changeFrequency: "monthly" },
  { path: "/docs/authentication", priority: 0.6, changeFrequency: "monthly" },
  { path: "/docs/webhooks", priority: 0.6, changeFrequency: "monthly" },
  { path: "/docs/limits", priority: 0.5, changeFrequency: "monthly" },
  { path: "/docs/errors", priority: 0.5, changeFrequency: "monthly" },
  { path: "/docs/api/products", priority: 0.6, changeFrequency: "monthly" },
  { path: "/docs/api/payment-links", priority: 0.6, changeFrequency: "monthly" },
  { path: "/docs/api/payments", priority: 0.6, changeFrequency: "monthly" },
  { path: "/docs/api/wallets", priority: 0.6, changeFrequency: "monthly" },
  { path: "/docs/api/webhooks", priority: 0.6, changeFrequency: "monthly" },
  { path: "/community", priority: 0.5, changeFrequency: "daily" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
