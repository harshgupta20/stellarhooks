import { type Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { requireAdminPage } from "@/server/auth/admin";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/shared/page-transition";

export const metadata: Metadata = {
  title: { default: "Founder Console", template: "%s — Founder Console" },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/iamfounder", label: "Overview" },
  { href: "/iamfounder/users", label: "Users" },
  { href: "/iamfounder/plans", label: "Plans" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-2">
            <Logo href="/iamfounder" />
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="size-3" />
              Founder
            </Badge>
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:inline">{admin.email}</span>
            <ThemeToggle />
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">
                App
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
