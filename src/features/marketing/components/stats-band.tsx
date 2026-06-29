import { Reveal } from "@/features/marketing/components/reveal";
import { CountUp } from "@/features/marketing/components/count-up";

const STATS = [
  { value: 256, suffix: "-bit", label: "Signed requests" },
  { value: 4, prefix: "", suffix: "×", label: "Retry attempts" },
  { value: 100, suffix: "%", label: "Logged & replayable" },
  { value: 7, suffix: " dp", label: "Decimal precision" },
];

export function StatsBand() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-6 rounded-2xl border bg-card/40 p-10 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 90} className="text-center">
            <div className="text-4xl font-semibold tracking-tight sm:text-5xl">
              <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
