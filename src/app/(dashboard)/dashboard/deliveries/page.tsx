import { type Metadata } from "next";
import { Send } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listDeliveries } from "@/server/services/delivery-service";
import { parsePageParams } from "@/lib/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { DeliveriesTable } from "@/features/deliveries/components/deliveries-table";

export const metadata: Metadata = { title: "Deliveries — StellarHooks" };

export default async function DeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();
  const network = await getModeNetwork();
  const { page } = await searchParams;
  const params = parsePageParams({ page });
  const { deliveries, meta } = await listDeliveries(user.id, params, { network });

  const hrefFor = (p: number) => `/dashboard/deliveries?page=${p}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliveries"
        description="Every webhook delivery attempt, with status and response details."
      />

      {deliveries.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No deliveries yet"
          description="Webhook delivery attempts will appear here once events are sent."
        />
      ) : (
        <>
          <DeliveriesTable deliveries={deliveries} />
          <Pagination
            meta={meta}
            prevHref={hrefFor(meta.page - 1)}
            nextHref={hrefFor(meta.page + 1)}
          />
        </>
      )}
    </div>
  );
}
