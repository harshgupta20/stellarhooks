export interface DocLink {
  title: string;
  href: string;
}

export interface DocSection {
  title: string;
  items: DocLink[];
}

/** Sidebar structure for the documentation. */
export const DOCS_NAV: DocSection[] = [
  {
    title: "Getting started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quickstart", href: "/docs/quickstart" },
      { title: "Authentication", href: "/docs/authentication" },
      { title: "How it works", href: "/docs/how-it-works" },
    ],
  },
  {
    title: "API reference",
    items: [
      { title: "Products", href: "/docs/api/products" },
      { title: "Payment links", href: "/docs/api/payment-links" },
      { title: "Payments", href: "/docs/api/payments" },
      { title: "Wallets", href: "/docs/api/wallets" },
      { title: "Webhooks", href: "/docs/api/webhooks" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Webhooks & events", href: "/docs/webhooks" },
      { title: "Errors & pagination", href: "/docs/errors" },
      { title: "Limits & plans", href: "/docs/limits" },
    ],
  },
];

/** Flattened ordered list, used for prev/next navigation. */
export const DOCS_FLAT: DocLink[] = DOCS_NAV.flatMap((s) => s.items);
