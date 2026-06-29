import { cn } from "@/lib/utils";
import { communityCategoryLabel } from "@/lib/constants";

const TONES: Record<string, string> = {
  general: "bg-muted text-muted-foreground",
  payments: "bg-primary/10 text-primary",
  webhooks: "bg-success/10 text-success",
  wallets: "bg-warning/10 text-warning",
  api: "bg-primary/10 text-primary",
  billing: "bg-muted text-muted-foreground",
  bug: "bg-destructive/10 text-destructive",
  feature: "bg-success/10 text-success",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[category] ?? "bg-muted text-muted-foreground",
      )}
    >
      {communityCategoryLabel(category)}
    </span>
  );
}
