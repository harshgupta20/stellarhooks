import {
  Activity,
  ShieldCheck,
  RefreshCw,
  ScrollText,
  WalletCards,
  ServerCrash,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/features/marketing/components/section-heading";
import { Reveal } from "@/features/marketing/components/reveal";
import { SpotlightCard } from "@/features/marketing/components/spotlight-card";

function Tile({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <SpotlightCard
      className={cn(
        "group h-full overflow-hidden rounded-2xl border bg-card/50 p-6 transition-colors hover:bg-card",
        className,
      )}
    >
      {children}
    </SpotlightCard>
  );
}

function TileHead({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Activity;
  title: string;
  desc: string;
}) {
  return (
    <>
      <span className="mb-4 flex size-10 items-center justify-center rounded-lg border bg-background text-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
    </>
  );
}

const BACKOFF = ["30s", "2m", "10m", "1h"];

export function FeaturesBento() {
  return (
    <section id="features" className="px-6 py-24">
      <SectionHeading
        eyebrow="Why StellarHooks"
        title={<>Everything you&apos;d build — already built</>}
        subtitle="Payment → verified, retried, logged webhook."
      />

      <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
        <Reveal className="md:col-span-2" direction="up">
          <Tile className="h-full">
            <TileHead
              icon={Activity}
              title="Auto-detected"
              desc="Caught the moment it settles. Never doubled."
            />
            <div className="mt-6 space-y-2 rounded-lg border bg-background/60 p-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success" />
                <span>payment.received</span>
                <span className="text-muted-foreground">250.00 XLM</span>
                <span className="ml-auto text-success">detected</span>
              </div>
              <div className="flex items-center gap-2 opacity-70">
                <span className="size-1.5 rounded-full bg-success" />
                <span>payment.received</span>
                <span className="text-muted-foreground">42.50 XLM</span>
                <span className="ml-auto text-success">detected</span>
              </div>
            </div>
          </Tile>
        </Reveal>

        <Reveal delay={80}>
          <Tile className="h-full">
            <TileHead
              icon={ShieldCheck}
              title="Signed"
              desc="HMAC-SHA256 on every request."
            />
            <code className="mt-4 block truncate rounded-md border bg-background/60 px-2 py-1.5 font-mono text-[11px] text-muted-foreground">
              x-stellarhooks-signature: sha256=…
            </code>
          </Tile>
        </Reveal>

        <Reveal>
          <Tile className="h-full">
            <TileHead
              icon={RefreshCw}
              title="Auto-retried"
              desc="Backoff until it lands."
            />
            <div className="mt-4 flex flex-wrap gap-1.5">
              {BACKOFF.map((b) => (
                <span
                  key={b}
                  className="rounded-md border bg-background/60 px-2 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </Tile>
        </Reveal>

        <Reveal delay={80}>
          <Tile className="h-full">
            <TileHead
              icon={ScrollText}
              title="Fully logged"
              desc="Every attempt. Replay in one click."
            />
          </Tile>
        </Reveal>

        <Reveal delay={160}>
          <Tile className="h-full">
            <TileHead
              icon={WalletCards}
              title="Cloud wallets"
              desc="Create, fund, send — in-app."
            />
          </Tile>
        </Reveal>

        <Reveal className="md:col-span-3" direction="up">
          <Tile>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <ServerCrash className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-medium">Zero infrastructure</h3>
                  <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                    No queues. No workers. No Redis. We run it all.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
                {["no queues", "no workers", "no Redis"].map((t) => (
                  <span key={t} className="rounded-md border bg-background/60 px-2 py-1 line-through">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Tile>
        </Reveal>
      </div>
    </section>
  );
}
