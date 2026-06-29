"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/community", label: "Community" },
];

export function LandingNav({ authed }: { authed: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <nav
        className={cn(
          "flex w-full max-w-5xl items-center justify-between rounded-full border px-3 py-2 transition-all duration-300",
          scrolled
            ? "border-border bg-background/70 shadow-lg backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Logo className="pl-2" />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {authed ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href="/dashboard">
                Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/register">
                  Start free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
