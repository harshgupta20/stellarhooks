import { type Metadata } from "next";
import Link from "next/link";
import {
  Wallet,
  Webhook,
  Activity,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Package,
  CreditCard,
  Coins,
  Clock,
} from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { getDashboardStats } from "@/server/services/stats-service";
import { getRevenueStats, listPayments } from "@/server/services/payment-service";
import { getPlanUsage } from "@/server/services/plan-service";
import { parsePageParams } from "@/lib/pagination";
import { formatAmount } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentsTable } from "@/features/payments/components/payments-table";

export const metadata: Metadata = { title: "Overview — StellarHooks" };

const TRACKS = [
  {
    title: "Accept payments",
    steps: [
      { label: "Create a product", href: "/dashboard/products" },
      { label: "Share a payment link", href: "/dashboard/products" },
      { label: "Get paid", href: "/dashboard/payments" },
    ],
  },
  {
    title: "Watch wallets & get webhooks",
    steps: [
      { label: "Add a monitored wallet", href: "/dashboard/wallets" },
      { label: "Add a webhook", href: "/dashboard/webhooks" },
      { label: "Receive events", href: "/dashboard/events" },
    ],
  },
];

export default async function OverviewPage() {
  const user = await requireUser();
  const network = await getModeNetwork();
  const [stats, revenue, plan, recent] = await Promise.all([
    getDashboardStats(user.id, network),
    getRevenueStats(user.id, network),
    getPlanUsage(user.id),
    listPayments(user.id, parsePageParams({ pageSize: 5 }), { network }),
  ]);

  const primaryRevenue = revenue.revenueByAsset[0];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <PageHeader title="Overview" description="Your payments and webhook activity at a glance." />
        <Badge variant={plan.plan === "PRO" ? "default" : "secondary"} className="shrink-0">
          {plan.plan === "PRO" ? "Pro plan" : "Free plan"}
        </Badge>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Payments
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Products" value={plan.usage.products} icon={Package} />
          <StatCard
            label="Confirmed payments"
            value={revenue.paymentsConfirmed}
            icon={CreditCard}
            accent="success"
          />
          <StatCard
            label={primaryRevenue ? `Revenue (${primaryRevenue.asset})` : "Revenue"}
            value={primaryRevenue ? formatAmount(primaryRevenue.total) : 0}
            icon={Coins}
          />
          <StatCard label="Pending" value={revenue.paymentsPending} icon={Clock} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Webhooks
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Monitored wallets" value={stats.walletCount} icon={Wallet} />
          <StatCard label="Webhooks" value={stats.webhookCount} icon={Webhook} />
          <StatCard label="Events today" value={stats.eventsToday} icon={Activity} />
          <StatCard
            label="Successful deliveries"
            value={stats.deliveriesSuccess}
            icon={CheckCircle2}
            accent="success"
          />
          <StatCard
            label="Failed deliveries"
            value={stats.deliveriesFailed}
            icon={XCircle}
            accent="destructive"
          />
        </div>
      </section>

      {recent.payments.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent payments
            </h2>
            <Link
              href="/dashboard/payments"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <PaymentsTable payments={recent.payments} />
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Get started
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {TRACKS.map((track) => (
              <Card key={track.title}>
                <CardContent className="space-y-3 py-1">
                  <p className="font-medium">{track.title}</p>
                  <ol className="space-y-2">
                    {track.steps.map((step, i) => (
                      <li key={step.label}>
                        <Link
                          href={step.href}
                          className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                            {i + 1}
                          </span>
                          {step.label}
                          <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild>
              <Link href="/dashboard/products">Create a product</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/wallets">Add a wallet</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
