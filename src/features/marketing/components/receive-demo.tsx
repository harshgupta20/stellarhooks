"use client";

import { useEffect, useRef, useState } from "react";
import { Wallet, Webhook, CheckCircle2, Sparkles, Coins } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/features/marketing/components/confetti";

type Stage = "idle" | "incoming" | "detecting" | "delivered";

const AMOUNTS = [250, 1000, 42.5, 500, 1337];

function formatXlm(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function ReceiveDemo() {
  const [stage, setStage] = useState<Stage>("idle");
  const [balance, setBalance] = useState(0);
  const [count, setCount] = useState(0);
  const [runId, setRunId] = useState(0);
  const [burstId, setBurstId] = useState(0);
  const [lastAmount, setLastAmount] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raf = useRef<number | null>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (raf.current) cancelAnimationFrame(raf.current);
  };

  useEffect(() => clearTimers, []);

  const animateBalance = (from: number, to: number) => {
    const start = performance.now();
    const duration = 700;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setBalance(from + (to - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const receive = () => {
    if (stage === "incoming" || stage === "detecting") return;
    clearTimers();

    const amount = AMOUNTS[count % AMOUNTS.length];
    setLastAmount(amount);
    setRunId((r) => r + 1);
    setStage("incoming");

    timers.current.push(setTimeout(() => setStage("detecting"), 750));
    timers.current.push(
      setTimeout(() => {
        setStage("delivered");
        setCount((c) => c + 1);
        setBurstId((b) => b + 1);
        animateBalance(balance, balance + amount);
      }, 1600),
    );
  };

  const nodeState = (node: "wallet" | "hook" | "api") => {
    if (node === "wallet") return stage !== "idle";
    if (node === "hook") return stage === "detecting" || stage === "delivered";
    return stage === "delivered";
  };

  const buttonLabel =
    stage === "idle"
      ? "Receive a payment"
      : stage === "delivered"
        ? "Send another 🎉"
        : "Incoming…";

  return (
    <div className="relative mx-auto max-w-md">
      <Confetti burstId={burstId} />

      <div className="relative overflow-hidden rounded-3xl border bg-card/70 p-6 shadow-2xl backdrop-blur-xl">
        {/* balance */}
        <div className="rounded-2xl border bg-background/60 p-5">
          <p className="text-xs text-muted-foreground">Your wallet balance</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              {formatXlm(balance)}
            </span>
            <span className="pb-1 text-sm font-medium text-muted-foreground">XLM</span>

            {/* dropping coin */}
            {(stage === "incoming" || stage === "detecting") && (
              <span
                key={runId}
                className="animate-coin-in ml-auto flex size-9 items-center justify-center rounded-full bg-warning/20 text-warning"
              >
                <Coins className="size-5" />
              </span>
            )}
            {stage === "delivered" && (
              <span className="animate-pop-in ml-auto text-sm font-semibold text-success">
                +{formatXlm(lastAmount)} XLM
              </span>
            )}
          </div>
        </div>

        {/* pipeline */}
        <div className="mt-5 flex items-center justify-between">
          {(
            [
              { key: "wallet", icon: Wallet, label: "Payment" },
              { key: "hook", icon: Webhook, label: "StellarHooks" },
              { key: "api", icon: CheckCircle2, label: "Your app" },
            ] as const
          ).map((node, i) => (
            <div key={node.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl border transition-all duration-300",
                    nodeState(node.key)
                      ? "border-primary/40 bg-primary text-primary-foreground scale-105"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  <node.icon className="size-5" />
                </span>
                <span className="text-[10px] text-muted-foreground">{node.label}</span>
              </div>
              {i < 2 && (
                <div className="mx-1 h-px flex-1 overflow-hidden bg-border">
                  <div
                    className={cn(
                      "h-full bg-primary transition-all duration-500",
                      (i === 0 && stage !== "idle" && stage !== "incoming") ||
                        (i === 1 && stage === "delivered")
                        ? "w-full"
                        : "w-0",
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* delivery log */}
        <div className="mt-5 h-9">
          {stage === "delivered" && (
            <div className="animate-pop-in flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 font-mono text-[11px]">
              <CheckCircle2 className="size-3.5 text-success" />
              <span>POST /your-webhook</span>
              <span className="ml-auto rounded bg-success/15 px-1.5 text-success">200 OK</span>
            </div>
          )}
        </div>

        <Button
          onClick={receive}
          disabled={stage === "incoming" || stage === "detecting"}
          size="lg"
          className="mt-5 w-full rounded-full text-base"
        >
          <Sparkles className="size-4" />
          {buttonLabel}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {count === 0
            ? "Tap the button — that's the whole integration."
            : `You've received ${count} payment${count > 1 ? "s" : ""} without writing a line of code.`}
        </p>
      </div>
    </div>
  );
}
