import { Braces, Zap, Package2, Feather } from "lucide-react";

import { Reveal } from "@/features/marketing/components/reveal";
import { CopyButton } from "@/components/shared/copy-button";

const CODE = `import { StellarPlatform } from "@stellarhooks/sdk";

const client = new StellarPlatform(API_KEY);

// Create a product
const product = await client.products.create({
  name: "Pro plan",
  walletId,
  assetCode: "XLM",
  priceType: "FIXED",
  price: "25",
});

// Share a payment link
const link = await client.paymentLinks.create({
  productId: product.id,
});
// → https://pay.app.com/p/abc123`;

const CHIPS = [
  { icon: Braces, label: "Fully typed" },
  { icon: Zap, label: "Promise-based" },
  { icon: Feather, label: "Tree-shakeable" },
  { icon: Package2, label: "Zero deps" },
];

export function SdkSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <Reveal direction="left">
          <div>
            <span className="text-sm font-medium uppercase tracking-widest text-brand-gradient">
              SDK
            </span>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-4xl">
              One client. <span className="text-brand-gradient">Everything.</span>
            </h2>
            <p className="mt-4 text-balance text-lg text-muted-foreground">
              Products, links, payments, wallets, webhooks — one typed TypeScript client.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1.5 text-sm font-medium backdrop-blur"
                >
                  <chip.icon className="size-4 text-muted-foreground" />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal direction="right" delay={100}>
          <div className="overflow-hidden rounded-xl border bg-card/60 backdrop-blur">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-destructive/50" />
              <span className="size-2.5 rounded-full bg-warning/50" />
              <span className="size-2.5 rounded-full bg-success/50" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">checkout.ts</span>
              <span className="ml-auto">
                <CopyButton value={CODE} label="Copy code" />
              </span>
            </div>
            <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
              <code className="font-mono text-muted-foreground">
                {CODE.split("\n").map((line, i) => (
                  <span key={i} className="block">
                    {line || " "}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
