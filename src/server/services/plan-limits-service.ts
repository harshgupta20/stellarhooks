import "server-only";

import { prisma } from "@/server/db/prisma";
import {
  DEFAULT_PLAN_LIMITS,
  type PlanTier,
  type PlanLimitResource,
} from "@/lib/constants";
import { type Plan } from "@/generated/prisma/enums";

/** Effective limit per plan/resource. -1 means unlimited. */
export type LimitsMatrix = Record<PlanTier, Record<PlanLimitResource, number>>;

/** Merge admin-set DB limits over the code defaults. */
export async function getEffectiveLimits(): Promise<LimitsMatrix> {
  const rows = await prisma.planLimit.findMany();
  const matrix: LimitsMatrix = {
    FREE: { ...DEFAULT_PLAN_LIMITS.FREE },
    PRO: { ...DEFAULT_PLAN_LIMITS.PRO },
    SCALE: { ...DEFAULT_PLAN_LIMITS.SCALE },
  };
  for (const row of rows) {
    const plan = row.plan as PlanTier;
    const resource = row.resource as PlanLimitResource;
    if (matrix[plan] && resource in matrix[plan]) matrix[plan][resource] = row.limit;
  }
  return matrix;
}

/** A single effective limit as a number (Infinity when unlimited). */
export async function getPlanLimit(plan: Plan, resource: PlanLimitResource): Promise<number> {
  const row = await prisma.planLimit.findUnique({
    where: { plan_resource: { plan, resource } },
  });
  const raw = row ? row.limit : DEFAULT_PLAN_LIMITS[plan as PlanTier][resource];
  return raw < 0 ? Number.POSITIVE_INFINITY : raw;
}

export interface PlanLimitUpdate {
  plan: PlanTier;
  resource: PlanLimitResource;
  limit: number;
}

/** Upsert admin-edited limits. */
export async function updatePlanLimits(entries: PlanLimitUpdate[]): Promise<void> {
  await prisma.$transaction(
    entries.map((e) =>
      prisma.planLimit.upsert({
        where: { plan_resource: { plan: e.plan, resource: e.resource } },
        create: { plan: e.plan, resource: e.resource, limit: e.limit },
        update: { limit: e.limit },
      }),
    ),
  );
}
