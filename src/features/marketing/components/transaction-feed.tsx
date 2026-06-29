import { ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/features/marketing/components/section-heading";

interface Tx {
  dir: "in" | "out";
  amount: string;
  asset: string;
  from: string;
  to: string;
  status: string;
  time: string;
}

const TXNS: Tx[] = [
  { dir: "in", amount: "250.00", asset: "XLM", from: "GD3L", to: "GBFO", status: "200", time: "just now" },
  { dir: "in", amount: "1,000.00", asset: "XLM", from: "GA7Q", to: "GBFO", status: "200", time: "2s ago" },
  { dir: "in", amount: "42.50", asset: "USDC", from: "GCEZ", to: "GBFO", status: "200", time: "4s ago" },
  { dir: "out", amount: "75.00", asset: "XLM", from: "GBFO", to: "GD9K", status: "200", time: "6s ago" },
  { dir: "in", amount: "5,000.00", asset: "XLM", from: "GBRP", to: "GBFO", status: "200", time: "9s ago" },
  { dir: "in", amount: "12.75", asset: "USDC", from: "GAU2", to: "GBFO", status: "retry", time: "11s ago" },
  { dir: "in", amount: "330.00", asset: "XLM", from: "GCGB", to: "GBFO", status: "200", time: "14s ago" },
  { dir: "out", amount: "1,337.00", asset: "XLM", from: "GBFO", to: "GBHK", status: "200", time: "18s ago" },
  { dir: "in", amount: "88.20", asset: "XLM", from: "GD3L", to: "GBFO", status: "200", time: "23s ago" },
  { dir: "in", amount: "640.00", asset: "USDC", from: "GBOP", to: "GBFO", status: "200", time: "27s ago" },
  { dir: "in", amount: "9.99", asset: "XLM", from: "GAFA", to: "GBFO", status: "200", time: "31s ago" },
  { dir: "in", amount: "2,400.00", asset: "XLM", from: "GD7Z", to: "GBFO", status: "200", time: "36s ago" },
];

function TxCard({ tx }: { tx: Tx }) {
  const incoming = tx.dir === "in";
  const ok = tx.status === "200";
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card/70 p-3 backdrop-blur-sm transition-transform hover:-translate-y-0.5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          incoming ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
        )}
      >
        {incoming ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm font-medium">
          <span className={incoming ? "text-success" : undefined}>
            {incoming ? "+" : "−"}
            {tx.amount}
          </span>
          <span className="font-mono text-xs text-muted-foreground">{tx.asset}</span>
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">
          {tx.from}… → {tx.to}…
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
            ok ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
          )}
        >
          <ShieldCheck className="size-3" />
          {tx.status}
        </span>
        <span className="text-[10px] text-muted-foreground">{tx.time}</span>
      </div>
    </div>
  );
}

const FADE_MASK =
  "linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)";

function FeedColumn({
  items,
  reverse = false,
  durationMs,
  className,
}: {
  items: Tx[];
  reverse?: boolean;
  durationMs: number;
  className?: string;
}) {
  return (
    <div
      className={cn("pause-on-hover relative h-[420px] overflow-hidden", className)}
      style={{ WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK }}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          reverse ? "animate-marquee-y-reverse" : "animate-marquee-y",
        )}
        style={{ animationDuration: `${durationMs}ms` }}
      >
        {[...items, ...items].map((tx, i) => (
          <TxCard key={i} tx={tx} />
        ))}
      </div>
    </div>
  );
}

export function TransactionFeed() {
  const colA = TXNS.filter((_, i) => i % 3 === 0).concat(TXNS.filter((_, i) => i % 3 === 1));
  const colB = TXNS.filter((_, i) => i % 3 === 1).concat(TXNS.filter((_, i) => i % 3 === 2));
  const colC = TXNS.filter((_, i) => i % 3 === 2).concat(TXNS.filter((_, i) => i % 3 === 0));

  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="animate-aurora absolute right-0 top-0 -z-10 size-[34rem] rounded-full bg-[radial-gradient(circle,_oklch(0.72_0.16_250_/_0.12),_transparent_65%)] blur-3xl" />

      <SectionHeading
        eyebrow="Always on"
        title={
          <>
            Your event stream, <span className="text-brand-gradient">never sleeping</span>
          </>
        }
        subtitle="Signed. Logged. Retried. Rolling in."
      />

      <div className="relative mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeedColumn items={colA} durationMs={26000} />
        <FeedColumn items={colB} durationMs={32000} reverse />
        <FeedColumn items={colC} durationMs={29000} className="hidden lg:block" />
      </div>
    </section>
  );
}
