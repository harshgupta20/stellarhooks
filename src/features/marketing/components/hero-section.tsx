import Link from "next/link";
import { ArrowRight, Sparkles, Activity, ShieldCheck, Send, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/features/marketing/components/aurora-background";
import { ConstellationField } from "@/features/marketing/components/constellation-field";
import { HeroDecor } from "@/features/marketing/components/hero-decor";
import { HeroVisual } from "@/features/marketing/components/hero-visual";
import { FloatingCoins } from "@/features/marketing/components/floating-coins";
import { Reveal } from "@/features/marketing/components/reveal";

const CHIPS = [
  { icon: Activity, label: "Detect" },
  { icon: ShieldCheck, label: "Sign" },
  { icon: Send, label: "Deliver" },
  { icon: RefreshCw, label: "Retry" },
];

export function HeroSection({ authed }: { authed: boolean }) {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 sm:pt-44">
      <AuroraBackground />
      <ConstellationField className="opacity-70 [mask-image:radial-gradient(ellipse_85%_70%_at_50%_30%,#000_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute left-1/2 top-40 -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.72_0.16_250/0.16),transparent_60%)] blur-3xl" />
      <HeroDecor />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-brand-gradient" />
            Payments + webhooks for Stellar
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Get paid on Stellar.
            <br />
            Know <span className="text-brand-gradient">instantly</span>.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Add a wallet. Add a URL. Done.
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
        </Reveal>

        <Reveal delay={280}>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group rounded-full px-6 text-base">
              <Link href={authed ? "/dashboard" : "/register"}>
                {authed ? "Open dashboard" : "Start free"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6 text-base">
              <Link href="#how">See how</Link>
            </Button>
          </div>
        </Reveal>
      </div>

      <Reveal delay={340} direction="none" className="relative z-10 mt-16 sm:mt-20">
        <div className="relative mx-auto w-full max-w-xl">
          <FloatingCoins />
          <HeroVisual />
        </div>
      </Reveal>
    </section>
  );
}
