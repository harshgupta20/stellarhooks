import { Info, AlertTriangle, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "info" | "warn" | "tip";

const STYLES: Record<Variant, { icon: typeof Info; className: string; iconClass: string }> = {
  info: { icon: Info, className: "border-primary/30 bg-primary/5", iconClass: "text-primary" },
  warn: {
    icon: AlertTriangle,
    className: "border-warning/40 bg-warning/10",
    iconClass: "text-warning",
  },
  tip: { icon: Lightbulb, className: "border-success/40 bg-success/10", iconClass: "text-success" },
};

export function Callout({
  variant = "info",
  children,
}: {
  variant?: Variant;
  children: React.ReactNode;
}) {
  const { icon: Icon, className, iconClass } = STYLES[variant];
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-4 text-sm", className)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", iconClass)} />
      <div className="leading-6 text-muted-foreground [&_a]:text-foreground [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
