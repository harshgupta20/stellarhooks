"use client";

import { useRef } from "react";
import { Wallet, Webhook, ShieldCheck, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Cube3D } from "@/features/marketing/components/cube-3d";

function Node({
  icon: Icon,
  title,
  subtitle,
  accent,
}: {
  icon: typeof Wallet;
  title: string;
  subtitle: string;
  accent?: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center gap-2 text-center">
      {accent && (
        <>
          <span className="absolute left-1/2 top-5 size-12 -translate-x-1/2 rounded-full bg-primary/30 [animation:pulse-ring_2.4s_ease-out_infinite]" />
          <span className="absolute left-1/2 top-5 size-12 -translate-x-1/2 rounded-full bg-primary/20 [animation:pulse-ring_2.4s_ease-out_infinite_0.8s]" />
        </>
      )}
      <span
        className={cn(
          "relative z-10 flex size-11 items-center justify-center rounded-xl border bg-card shadow-sm",
          accent && "border-primary/40 bg-primary text-primary-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs font-medium">{title}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Connector({ delay }: { delay: string }) {
  return (
    <div className="relative mx-1 mt-5 h-px flex-1 bg-gradient-to-r from-border via-primary/40 to-border">
      <span
        className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_14px_2px] shadow-primary/70 animate-packet"
        style={{ animationDelay: delay }}
      />
    </div>
  );
}

const LOG_LINES = [
  { evt: "payment.received", amt: "250.00 XLM", status: "200" },
  { evt: "payment.received", amt: "1,000.00 XLM", status: "200" },
  { evt: "payment.received", amt: "42.50 XLM", status: "200" },
];

export function HeroVisual() {
  const boardRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = boardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };

  const handleLeave = () => {
    if (boardRef.current) boardRef.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <div className="perspective relative mx-auto w-full max-w-xl">
      <Cube3D className="animate-float absolute -right-6 -top-10 z-20 hidden sm:block" />

      <div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="preserve-3d relative transition-transform duration-300 ease-out"
      >
        <div
          ref={boardRef}
          className="preserve-3d rounded-2xl border bg-card/80 p-5 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out"
        >
          {/* window chrome */}
          <div className="mb-5 flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-warning/60" />
            <span className="size-2.5 rounded-full bg-success/60" />
            <span className="ml-2 text-xs text-muted-foreground">live event stream</span>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
              <span className="size-1.5 animate-pulse rounded-full bg-success" />
              live
            </span>
          </div>

          {/* flow */}
          <div className="flex items-start justify-between">
            <Node icon={Wallet} title="Wallet" subtitle="GABC…7X" />
            <Connector delay="0s" />
            <Node icon={Webhook} title="StellarHooks" subtitle="HMAC signed" accent />
            <Connector delay="1.6s" />
            <Node icon={CheckCircle2} title="Your API" subtitle="200 OK" />
          </div>

          {/* console */}
          <div className="mt-6 space-y-1.5 rounded-lg border bg-background/60 p-3 font-mono text-[11px]">
            {LOG_LINES.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <ShieldCheck className="size-3 text-success" />
                <span className="text-foreground">{line.evt}</span>
                <span className="text-muted-foreground">{line.amt}</span>
                <span className="ml-auto rounded bg-success/15 px-1.5 text-success">
                  {line.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
