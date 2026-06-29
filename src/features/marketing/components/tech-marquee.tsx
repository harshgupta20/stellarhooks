const ITEMS = [
  "Payment links",
  "Hosted checkout",
  "Non-custodial",
  "HMAC-SHA256 signed",
  "Automatic retries",
  "TypeScript SDK",
  "Horizon-native",
  "Testnet + Mainnet",
  "Cloud wallets",
  "Full delivery logs",
  "Zero infrastructure",
  "Replayable events",
];

export function TechMarquee() {
  return (
    <section className="relative overflow-hidden border-y bg-card/30 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-marquee">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span
            key={i}
            className="mx-5 flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary/50" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
