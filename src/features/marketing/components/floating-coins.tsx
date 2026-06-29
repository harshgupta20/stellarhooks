import { Coins } from "lucide-react";

import { cn } from "@/lib/utils";

interface Chip {
  label: string;
  position: string;
  animation: string;
  delay: string;
  tone?: "success" | "default";
}

const CHIPS: Chip[] = [
  { label: "+250 XLM", position: "-left-6 top-6 sm:-left-16", animation: "animate-float", delay: "0s", tone: "success" },
  { label: "USDC", position: "-right-4 top-0 sm:-right-14", animation: "animate-float-slow", delay: "-2s" },
  { label: "+1,000 XLM", position: "-left-4 bottom-10 sm:-left-20", animation: "animate-float-slow", delay: "-4s", tone: "success" },
  { label: "200 OK", position: "-right-6 bottom-6 sm:-right-16", animation: "animate-float", delay: "-1.5s", tone: "success" },
];

/** Decorative floating token/amount chips around the hero visual. */
export function FloatingCoins() {
  return (
    <>
      {CHIPS.map((chip) => (
        <span
          key={chip.label}
          aria-hidden
          style={{ animationDelay: chip.delay }}
          className={cn(
            "absolute z-20 hidden items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur sm:flex",
            chip.position,
            chip.animation,
            chip.tone === "success" ? "text-success" : "text-muted-foreground",
          )}
        >
          <Coins className="size-3.5" />
          {chip.label}
        </span>
      ))}
    </>
  );
}
