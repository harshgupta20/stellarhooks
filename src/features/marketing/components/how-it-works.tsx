import { Fragment } from "react";
import { Wallet, Webhook, PartyPopper, ArrowRight } from "lucide-react";

import { SectionHeading } from "@/features/marketing/components/section-heading";
import { Reveal } from "@/features/marketing/components/reveal";

const STEPS = [
  { icon: Wallet, word: "Add wallet", hint: "paste an address", accent: false },
  { icon: Webhook, word: "Add webhook", hint: "your URL", accent: true },
  { icon: PartyPopper, word: "Get paid", hint: "signed events", accent: false },
];

function Station({
  icon: Icon,
  word,
  hint,
  index,
  accent,
}: {
  icon: typeof Wallet;
  word: string;
  hint: string;
  index: number;
  accent: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {accent && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary/25 [animation:pulse-ring_2.6s_ease-out_infinite]" />
            <span className="absolute inset-0 rounded-full bg-primary/15 [animation:pulse-ring_2.6s_ease-out_infinite_0.9s]" />
          </>
        )}
        <div className="relative grid size-24 place-items-center rounded-full border bg-card shadow-xl">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary/10 to-transparent" />
          <Icon className="size-10" />
          <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow">
            {index + 1}
          </span>
        </div>
      </div>
      <p className="mt-5 text-xl font-semibold tracking-tight">{word}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="relative mt-12 hidden h-px flex-1 self-start bg-gradient-to-r from-border via-primary/50 to-border md:block">
      <span className="animate-packet absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_16px_3px] shadow-primary/70" />
      <ArrowRight className="absolute -right-1 top-1/2 size-4 -translate-y-1/2 text-primary/60" />
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden px-6 py-28">
      <div className="bg-grid bg-grid-fade absolute inset-0 -z-10 opacity-40" />

      <SectionHeading eyebrow="How it works" title="Three taps. You're live." />

      <div className="mx-auto mt-16 flex max-w-4xl flex-col items-center gap-10 md:flex-row md:items-start md:justify-between md:gap-2">
        {STEPS.map((step, i) => (
          <Fragment key={step.word}>
            <Reveal delay={i * 160}>
              <Station {...step} index={i} />
            </Reveal>
            {i < STEPS.length - 1 && <FlowConnector />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
