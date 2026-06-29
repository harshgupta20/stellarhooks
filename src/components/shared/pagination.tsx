import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { type PageMeta } from "@/lib/pagination";

export function Pagination({
  meta,
  prevHref,
  nextHref,
}: {
  meta: PageMeta;
  prevHref: string;
  nextHref: string;
}) {
  const hasPrev = meta.page > 1;
  const hasNext = meta.page < meta.totalPages;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <p className="text-muted-foreground">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={prevHref}
          aria-disabled={!hasPrev}
          tabIndex={hasPrev ? undefined : -1}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            !hasPrev && "pointer-events-none opacity-50",
          )}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Link>
        <Link
          href={nextHref}
          aria-disabled={!hasNext}
          tabIndex={hasNext ? undefined : -1}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            !hasNext && "pointer-events-none opacity-50",
          )}
        >
          Next
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
