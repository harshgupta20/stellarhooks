import { cn } from "@/lib/utils";
import { Reveal } from "@/features/marketing/components/reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <Reveal>
        <span className="text-sm font-medium uppercase tracking-widest text-brand-gradient">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={140}>
          <p className="mt-4 text-balance text-lg text-muted-foreground">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
