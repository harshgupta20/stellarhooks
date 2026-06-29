import { type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/server/auth/admin";
import { updatePlanLimits } from "@/server/services/plan-limits-service";
import { ok, handleApiError } from "@/server/http/api-response";
import { PLANS, PLAN_RESOURCES, type PlanTier, type PlanLimitResource } from "@/lib/constants";

const bodySchema = z.object({
  limits: z.record(z.string(), z.record(z.string(), z.number().int().gte(-1))),
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { limits } = bodySchema.parse(await req.json());

    const entries = Object.entries(limits).flatMap(([plan, resources]) =>
      Object.entries(resources ?? {})
        .filter(
          ([resource]) =>
            (PLANS as readonly string[]).includes(plan) &&
            (PLAN_RESOURCES as string[]).includes(resource),
        )
        .map(([resource, limit]) => ({
          plan: plan as PlanTier,
          resource: resource as PlanLimitResource,
          limit,
        })),
    );

    if (entries.length === 0) {
      return ok({ success: true, updated: 0 });
    }
    await updatePlanLimits(entries);
    return ok({ success: true, updated: entries.length });
  } catch (error) {
    return handleApiError(error);
  }
}
