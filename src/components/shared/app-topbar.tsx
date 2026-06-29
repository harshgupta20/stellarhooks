"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { NAV_ITEMS } from "@/components/shared/app-sidebar";
import { type AppMode } from "@/lib/mode";

export function AppTopbar({
  email,
  name,
  mode,
}: {
  email: string;
  name: string | null;
  mode: AppMode;
}) {
  const pathname = usePathname();

  return (
    <header className="bg-card/40 flex h-14 items-center justify-between gap-2 border-b px-4 md:px-6">
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {NAV_ITEMS.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn("gap-3", active && "text-foreground font-medium")}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ModeToggle mode={mode} />
        <ThemeToggle />
        <UserMenu email={email} name={name} />
      </div>
    </header>
  );
}
