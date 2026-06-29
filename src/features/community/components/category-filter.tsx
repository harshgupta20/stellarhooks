import Link from "next/link";

import { cn } from "@/lib/utils";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";

export function CategoryFilter({ active }: { active?: string }) {
  const chips = [{ value: "", label: "All" }, ...COMMUNITY_CATEGORIES];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => {
        const isActive = (active ?? "") === c.value;
        return (
          <Link
            key={c.value || "all"}
            href={c.value ? `/community?category=${c.value}` : "/community"}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}
