import { type Metadata } from "next";
import Link from "next/link";
import { CreditCard, CheckCircle2, Clock, Wallet } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listPayments, getRevenueStats } from "@/server/services/payment-service";
import { parsePageParams } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentsTable } from "@/features/payments/components/payments-table";
import { type PaymentStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Payments — StellarHooks" };

const FILTERS: { label: string; value?: PaymentStatus }[] = [
  { label: "All" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
];

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const user = await requireUser();
  const network = await getModeNetwork();
  const { page, status } = await searchParams;
  const params = parsePageParams({ page });
  const statusFilter = ["CONFIRMED", "PENDING", "FAILED"].includes(status ?? "")
    ? (status as PaymentStatus)
    : undefined;

  const [{ payments, meta }, stats] = await Promise.all([
    listPayments(user.id, params, { status: statusFilter, network }),
    getRevenueStats(user.id, network),
  ]);

  const primaryRevenue = stats.revenueByAsset[0];
  const hrefFor = (s?: PaymentStatus) =>
    s ? `/dashboard/payments?status=${s}` : "/dashboard/payments";

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Confirmed on-chain payments for your products." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Confirmed payments"
          value={stats.paymentsConfirmed}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard label="Pending" value={stats.paymentsPending} icon={Clock} />
        <StatCard
          label={primaryRevenue ? `Revenue (${primaryRevenue.asset})` : "Revenue"}
          value={primaryRevenue ? formatAmount(primaryRevenue.total) : 0}
          icon={Wallet}
        />
      </div>

      {stats.revenueByAsset.length > 1 && (
        <Card>
          <CardContent className="flex flex-wrap gap-6 py-1">
            {stats.revenueByAsset.map((r) => (
              <div key={r.asset}>
                <p className="text-sm text-muted-foreground">{r.asset}</p>
                <p className="text-xl font-semibold tabular-nums">{formatAmount(r.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <Link
              key={f.label}
              href={hrefFor(f.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Share a payment link — confirmed payments will appear here automatically."
        />
      ) : (
        <>
          <PaymentsTable payments={payments} />
          <Pagination
            meta={meta}
            prevHref={`/dashboard/payments?page=${meta.page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
            nextHref={`/dashboard/payments?page=${meta.page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
          />
        </>
      )}
    </div>
  );
}
