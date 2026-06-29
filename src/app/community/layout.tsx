import { type Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getCurrentUser } from "@/server/auth/guards";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/shared/page-transition";

export const metadata: Metadata = {
  title: { default: "Community — StellarHooks", template: "%s — StellarHooks Community" },
  description: "Ask open questions about StellarHooks and help other developers.",
};

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-2">
            <Logo />
            <Badge variant="secondary">Community</Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/docs">Docs</Link>
            </Button>
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Start free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
