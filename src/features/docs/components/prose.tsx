import { cn } from "@/lib/utils";

export function DocHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-3 border-b pb-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
    </div>
  );
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold tracking-tight">{children}</h3>;
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[15px] leading-7 text-muted-foreground", className)}>{children}</p>;
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-1 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-[15px] leading-7 text-muted-foreground">
          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Inline code token. */
export function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}
