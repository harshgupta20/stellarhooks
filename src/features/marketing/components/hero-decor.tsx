import { ArrowDownLeft, ShieldCheck, RefreshCw, Coins, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

function Floed({
  className,
  delay,
  float = "animate-float",
  children,
}: {
  className?: string;
  delay?: string;
  float?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden
      style={{ animationDelay: delay }}
      className={cn(
        "absolute hidden rounded-xl border bg-card/70 px-3 py-2 shadow-xl backdrop-blur-md lg:flex",
        float,
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Floating mini-cards spread across the hero to fill negative space (lg+ only). */
export function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {/* top-left: incoming payment card */}
      <Floed className="left-[5%] top-[22%] items-center gap-2" delay="0s">
        <span className="flex size-7 items-center justify-center rounded-lg bg-success/15 text-success">
          <ArrowDownLeft className="size-4" />
        </span>
        <span className="text-left">
          <span className="block text-sm font-medium text-success">+250.00 XLM</span>
          <span className="block font-mono text-[10px] text-muted-foreground">received</span>
        </span>
      </Floed>

      {/* top-right: signed pill */}
      <Floed
        className="right-[6%] top-[18%] items-center gap-1.5 text-xs font-medium"
        delay="-2s"
        float="animate-float-slow"
      >
        <ShieldCheck className="size-3.5 text-success" />
        HMAC-SHA256
      </Floed>

      {/* mid-left: asset chip */}
      <Floed
        className="left-[8%] top-[52%] items-center gap-1.5 text-xs font-medium"
        delay="-3.5s"
        float="animate-float-slow"
      >
        <Coins className="size-3.5 text-muted-foreground" />
        USDC
      </Floed>

      {/* mid-right: latency pill */}
      <Floed
        className="right-[7%] top-[50%] items-center gap-1.5 text-xs font-medium"
        delay="-1s"
      >
        <Zap className="size-3.5 text-warning" />
        delivered · 38ms
      </Floed>

      {/* lower-left: address chip */}
      <Floed
        className="bottom-[16%] left-[12%] items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        delay="-2.6s"
        float="animate-float-slow"
      >
        GD3L…7X
      </Floed>

      {/* lower-right: retry mini */}
      <Floed
        className="bottom-[18%] right-[11%] items-center gap-1.5 text-xs font-medium"
        delay="-4.2s"
      >
        <RefreshCw className="size-3.5 text-muted-foreground" />
        auto-retry
      </Floed>
    </div>
  );
}
