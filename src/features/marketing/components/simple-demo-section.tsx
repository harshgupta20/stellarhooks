import { Baby, Code2, Server, Timer } from "lucide-react";

import { Reveal } from "@/features/marketing/components/reveal";
import { ReceiveDemo } from "@/features/marketing/components/receive-demo";

const POINTS = [
  { icon: Code2, title: "No code", desc: "Pure configuration." },
  { icon: Server, title: "No servers", desc: "We run it all." },
  { icon: Timer, title: "No waiting", desc: "Instant on settle." },
];

export function SimpleDemoSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="animate-aurora absolute left-1/2 top-1/3 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_oklch(0.7_0.17_162_/_0.12),_transparent_65%)] blur-3xl" />

      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Baby className="size-3.5 text-brand-gradient" />
              So simple it&apos;s almost silly
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              If you can tap a button, you can <span className="text-brand-gradient">get paid</span>{" "}
              on Stellar
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 text-balance text-lg text-muted-foreground">
              No code. No backend. Just tap the button. 👶
            </p>
          </Reveal>

          <div className="mt-8 space-y-4">
            {POINTS.map((point, i) => (
              <Reveal key={point.title} delay={200 + i * 80} direction="left">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-foreground">
                    <point.icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">{point.title}</p>
                    <p className="text-sm text-muted-foreground">{point.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal direction="right" delay={120}>
          <ReceiveDemo />
        </Reveal>
      </div>
    </section>
  );
}
