import { type Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocsSidebar } from "@/features/docs/components/docs-sidebar";
import { PageTransition } from "@/components/shared/page-transition";

export const metadata: Metadata = {
  title: { default: "Docs — StellarHooks", template: "%s — StellarHooks Docs" },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-2">
            <Logo />
            <Badge variant="secondary">Docs</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/">Home</Link>
            </Button>
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/dashboard">
                Dashboard
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <details className="border-b px-6 py-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
          Browse docs
        </summary>
        <div className="pt-4">
          <DocsSidebar />
        </div>
      </details>

      <div className="mx-auto max-w-7xl gap-10 px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] self-start overflow-y-auto py-10 lg:block">
          <DocsSidebar />
        </aside>
        <main className="min-w-0 py-10">
          <div className="mx-auto max-w-3xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
