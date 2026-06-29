"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { DOCS_FLAT } from "@/features/docs/nav";

/** Previous / next page links based on the current route. */
export function DocsPager() {
  const pathname = usePathname();
  const index = DOCS_FLAT.findIndex((d) => d.href === pathname);
  if (index === -1) return null;

  const prev = index > 0 ? DOCS_FLAT[index - 1] : null;
  const next = index < DOCS_FLAT.length - 1 ? DOCS_FLAT[index + 1] : null;

  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="group flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground"
        >
          {next.title}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
