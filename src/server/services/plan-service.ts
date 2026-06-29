import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import {
  RESOURCE_LABELS,
  PLAN_LABELS,
  type PlanLimitResource,
  type PlanTier,
} from "@/lib/constants";
import { getPlanLimit, getEffectiveLimits } from "@/server/services/plan-limits-service";
import { type Plan } from "@/generated/prisma/enums";

async function countResource(userId: string, resource: PlanLimitResource): Promise<number> {
  switch (resource) {
    case "wallets":
      return prisma.wallet.count({ where: { userId } });
    case "webhooks":
      return prisma.webhook.count({ where: { userId } });
    case "products":
      return prisma.product.count({ where: { userId } });
    case "cloudWallets":
      return prisma.cloudWallet.count({ where: { userId } });
  }
}

async function getPlan(userId: string): Promise<Plan> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  return user?.plan ?? "FREE";
}

/**
 * Throw a 403 if creating another `resource` would exceed the user's plan limit.
 * PRO plans are unlimited.
 */
export async function assertWithinPlanLimit(
  userId: string,
  resource: PlanLimitResource,
): Promise<void> {
  const plan = await getPlan(userId);
  const limit = await getPlanLimit(plan, resource);
  if (!Number.isFinite(limit)) return;

  const count = await countResource(userId, resource);
  if (count >= limit) {
    throw Errors.forbidden(
      `Your ${PLAN_LABELS[plan as PlanTier]} plan allows up to ${limit} ${RESOURCE_LABELS[resource]}. Upgrade your plan for more.`,
    );
  }
}

export interface PlanUsage {
  plan: Plan;
  limits: Record<PlanLimitResource, number>;
  usage: Record<PlanLimitResource, number>;
}

/** Current plan, limits, and usage counts (for the dashboard / settings). */
export async function getPlanUsage(userId: string): Promise<PlanUsage> {
  const plan = await getPlan(userId);
  const [limits, wallets, webhooks, products, cloudWallets] = await Promise.all([
    getEffectiveLimits(),
    countResource(userId, "wallets"),
    countResource(userId, "webhooks"),
    countResource(userId, "products"),
    countResource(userId, "cloudWallets"),
  ]);
  return {
    plan,
    limits: limits[plan as PlanTier],
    usage: { wallets, webhooks, products, cloudWallets },
  };
}
