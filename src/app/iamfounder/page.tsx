import { type Metadata } from "next";
import { Users, Crown, Wallet, Package, Webhook, CreditCard } from "lucide-react";

import Link from "next/link";

import { getPlatformStats } from "@/server/services/admin-service";
import { getEffectiveLimits } from "@/server/services/plan-limits-service";
import {
  PLANS,
  PLAN_LABELS,
  PLAN_RESOURCES,
  RESOURCE_LABELS,
  formatLimit,
} from "@/lib/constants";
import { formatAmount } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const [stats, limits] = await Promise.all([getPlatformStats(), getEffectiveLimits()]);
  const primaryRevenue = stats.revenueByAsset[0];

  return (
    <div className="space-y-8">
      <PageHeader title="Founder Console" description="Platform-wide metrics and controls." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value={stats.users} icon={Users} />
        <StatCard label="Pro users" value={stats.proUsers} icon={Crown} accent="success" />
        <StatCard label="Free users" value={stats.freeUsers} icon={Users} />
        <StatCard label="Monitored wallets" value={stats.wallets} icon={Wallet} />
        <StatCard label="Products" value={stats.products} icon={Package} />
        <StatCard label="Webhooks" value={stats.webhooks} icon={Webhook} />
        <StatCard
          label="Confirmed payments"
          value={stats.paymentsConfirmed}
          icon={CreditCard}
          accent="success"
        />
        <StatCard
          label={primaryRevenue ? `Revenue (${primaryRevenue.asset})` : "Revenue"}
          value={primaryRevenue ? formatAmount(primaryRevenue.total) : 0}
          icon={CreditCard}
        />
      </div>

      {stats.revenueByAsset.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by asset</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            {stats.revenueByAsset.map((r) => (
              <div key={r.asset}>
                <p className="text-sm text-muted-foreground">{r.asset}</p>
                <p className="text-xl font-semibold tabular-nums">{formatAmount(r.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Plan limits</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/iamfounder/plans">Edit</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[30rem] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Resource</th>
                  {PLANS.map((plan) => (
                    <th key={plan} className="p-3 font-medium">
                      {PLAN_LABELS[plan]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {PLAN_RESOURCES.map((r) => (
                  <tr key={r}>
                    <td className="p-3 capitalize">{RESOURCE_LABELS[r]}</td>
                    {PLANS.map((plan) => (
                      <td key={plan} className="p-3 tabular-nums">
                        {formatLimit(limits[plan][r])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
