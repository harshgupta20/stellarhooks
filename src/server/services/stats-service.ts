import "server-only";

import { prisma } from "@/server/db/prisma";
import { type Network } from "@/lib/constants";

export interface DashboardStats {
  walletCount: number;
  webhookCount: number;
  eventsToday: number;
  deliveriesSuccess: number;
  deliveriesFailed: number;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardStats(
  userId: string,
  network?: Network,
): Promise<DashboardStats> {
  const net = network ? { network } : {};
  const [walletCount, webhookCount, eventsToday, deliveriesSuccess, deliveriesFailed] =
    await Promise.all([
      prisma.wallet.count({ where: { userId, ...net } }),
      prisma.webhook.count({ where: { userId, ...net } }),
      prisma.event.count({
        where: { wallet: { userId, ...net }, createdAt: { gte: startOfToday() } },
      }),
      prisma.delivery.count({
        where: { webhook: { userId, ...net }, status: "SUCCESS" },
      }),
      prisma.delivery.count({
        where: { webhook: { userId, ...net }, status: { in: ["FAILED", "EXHAUSTED"] } },
      }),
    ]);

  return { walletCount, webhookCount, eventsToday, deliveriesSuccess, deliveriesFailed };
}
