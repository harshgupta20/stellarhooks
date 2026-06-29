import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "success" | "destructive" | "default";
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        </div>
        <span
          className={cn(
            "bg-secondary text-muted-foreground flex size-10 items-center justify-center rounded-lg",
            accent === "success" && "bg-success/15 text-success",
            accent === "destructive" && "bg-destructive/15 text-destructive",
          )}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
