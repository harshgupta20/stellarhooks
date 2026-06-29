"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  WalletCards,
  Webhook,
  Activity,
  Send,
  Package,
  CreditCard,
  KeyRound,
  MessagesSquare,
} from "lucide-react";

import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/community", label: "Community", icon: MessagesSquare },
    ],
  },
  {
    title: "Payments",
    items: [
      { href: "/dashboard/products", label: "Products", icon: Package },
      { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    title: "Webhooks",
    items: [
      { href: "/dashboard/wallets", label: "Monitored Wallets", icon: Wallet },
      { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
      { href: "/dashboard/events", label: "Events", icon: Activity },
      { href: "/dashboard/deliveries", label: "Deliveries", icon: Send },
    ],
  },
  {
    title: "Wallets",
    items: [{ href: "/dashboard/cloud-wallets", label: "Cloud Wallets", icon: WalletCards }],
  },
  {
    title: "Developer",
    items: [{ href: "/dashboard/api-keys", label: "API Keys", icon: KeyRound }],
  },
];

const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-card/40 hidden w-60 shrink-0 flex-col border-r md:flex">
      <div className="flex h-14 items-center border-b px-5">
        <Logo href="/dashboard" />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.title ?? i} className="space-y-1">
            {section.title && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export { NAV_ITEMS };
