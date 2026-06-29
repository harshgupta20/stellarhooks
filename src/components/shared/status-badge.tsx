import { cn } from "@/lib/utils";

type Tone = "active" | "paused" | "success" | "failed" | "pending" | "exhausted" | "neutral";

const TONE_STYLES: Record<Tone, string> = {
  active: "bg-success/15 text-success",
  success: "bg-success/15 text-success",
  paused: "bg-muted text-muted-foreground",
  neutral: "bg-muted text-muted-foreground",
  pending: "bg-warning/15 text-warning",
  failed: "bg-destructive/15 text-destructive",
  exhausted: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        TONE_STYLES[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
