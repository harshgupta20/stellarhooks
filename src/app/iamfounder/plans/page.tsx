import { type Metadata } from "next";

import { requireAdminPage } from "@/server/auth/admin";
import { getEffectiveLimits } from "@/server/services/plan-limits-service";
import { PageHeader } from "@/components/shared/page-header";
import { PlanLimitsEditor } from "@/features/admin/components/plan-limits-editor";

export const metadata: Metadata = { title: "Plans" };

export default async function AdminPlansPage() {
  await requireAdminPage();
  const limits = await getEffectiveLimits();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans & limits"
        description="Edit the resource caps for each plan. Upgrade a user's plan from the Users tab."
      />
      <PlanLimitsEditor initial={limits} />
    </div>
  );
}
