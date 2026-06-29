import { Link2, QrCode, ShieldCheck, Webhook, Copy, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/features/marketing/components/reveal";

const POINTS = [
  { icon: Link2, title: "Payment links", desc: "One product, share a URL." },
  { icon: QrCode, title: "Hosted page + QR", desc: "Scan, pay, done." },
  { icon: ShieldCheck, title: "Non-custodial", desc: "Funds land in your wallet." },
  { icon: Webhook, title: "Webhook on paid", desc: "payment.completed, signed." },
];

// Deterministic (pure) faux-QR pattern so render stays idempotent.
function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function QrMock() {
  const cells = 13;
  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) => r >= br && r < br + 3 && c >= bc && c < bc + 3;
    return inBox(0, 0) || inBox(0, cells - 3) || inBox(cells - 3, 0);
  };
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} className="size-36 [shape-rendering:crispEdges]">
      <rect width={cells} height={cells} fill="white" />
      {Array.from({ length: cells * cells }, (_, i) => {
        const r = Math.floor(i / cells);
        const c = i % cells;
        const finder = isFinder(r, c);
        const on = finder || rand(r * 31 + c * 7) > 0.55;
        if (!on) return null;
        return <rect key={i} x={c} y={r} width={1} height={1} fill="#0b0b0f" />;
      })}
    </svg>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 rounded-md border bg-background/60 p-2">
        <code className="flex-1 truncate font-mono text-[11px] text-muted-foreground">{value}</code>
        <Copy className="size-3 text-muted-foreground" />
      </div>
    </div>
  );
}

export function PaymentShowcase() {
  return (
    <section id="payments" className="relative overflow-hidden px-6 py-24">
      <div className="animate-aurora absolute -left-20 top-1/4 -z-10 size-[32rem] rounded-full bg-[radial-gradient(circle,oklch(0.65_0.2_300/0.12),transparent_65%)] blur-3xl" />

      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="text-sm font-medium uppercase tracking-widest text-brand-gradient">
              Accept payments
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Get paid with a <span className="text-brand-gradient">link</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-4 text-balance text-lg text-muted-foreground">
              Create a product, share a link, get paid. No checkout to build.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {POINTS.map((point, i) => (
              <Reveal key={point.title} delay={200 + i * 70} direction="left">
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
          <div className="animate-float mx-auto w-full max-w-sm rounded-3xl border bg-card/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl border bg-gradient-to-br from-primary/20 to-transparent">
                <Package className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">Pro plan</p>
                <p className="truncate text-xs text-muted-foreground">Yearly subscription</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                Stellar
              </Badge>
            </div>

            <div className="mt-5 rounded-xl border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">Amount due</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                25 <span className="text-base font-normal text-muted-foreground">XLM</span>
              </p>
            </div>

            <div className="mt-5 flex justify-center">
              <div className="rounded-xl border bg-white p-2.5">
                <QrMock />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <CopyRow label="ADDRESS" value="GABC…XQ7Z" />
              <CopyRow label="MEMO" value="4mwcgjrsgg" />
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-success">
              <ShieldCheck className="size-3.5" />
              Funds go straight to your wallet
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
