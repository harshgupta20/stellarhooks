import { type Metadata } from "next";
import { Webhook } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listWebhooks } from "@/server/services/webhook-service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { WebhookCreateDialog } from "@/features/webhooks/components/webhook-create-dialog";
import { WebhooksTable } from "@/features/webhooks/components/webhooks-table";

export const metadata: Metadata = { title: "Webhooks — StellarHooks" };

export default async function WebhooksPage() {
  const user = await requireUser();
  const network = await getModeNetwork();
  const webhooks = await listWebhooks(user.id, network);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Endpoints that receive signed payment events."
        action={<WebhookCreateDialog />}
      />

      {webhooks.length === 0 ? (
        <EmptyState
          icon={Webhook}
          title="No webhooks yet"
          description="Add an endpoint URL to start receiving signed payment events."
          action={<WebhookCreateDialog />}
        />
      ) : (
        <WebhooksTable webhooks={webhooks} />
      )}
    </div>
  );
}
