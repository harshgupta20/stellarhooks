import { type Metadata } from "next";
import { Activity } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listEvents } from "@/server/services/event-service";
import { parsePageParams } from "@/lib/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { EventsTable } from "@/features/events/components/events-table";

export const metadata: Metadata = { title: "Events — StellarHooks" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();
  const network = await getModeNetwork();
  const { page } = await searchParams;
  const params = parsePageParams({ page });
  const { events, meta } = await listEvents(user.id, params, { network });

  const hrefFor = (p: number) => `/dashboard/events?page=${p}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Events" description="Incoming payments detected across your wallets." />

      {events.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No events yet"
          description="Once a monitored wallet receives a payment, it will appear here."
        />
      ) : (
        <>
          <EventsTable events={events} />
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
