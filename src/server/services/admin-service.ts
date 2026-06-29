import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { buildPageMeta, type PageMeta, type PageParams } from "@/lib/pagination";
import { type PlatformStats, type AdminUserDTO } from "@/features/admin/types";
import { type Plan, type Role, type Prisma } from "@/generated/prisma/client";

export async function getPlatformStats(): Promise<PlatformStats> {
  const [users, proUsers, wallets, products, webhooks, paymentsConfirmed, grouped] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: "PRO" } }),
      prisma.wallet.count(),
      prisma.product.count(),
      prisma.webhook.count(),
      prisma.payment.count({ where: { status: "CONFIRMED" } }),
      prisma.payment.groupBy({
        by: ["assetCode"],
        where: { status: "CONFIRMED" },
        _sum: { amount: true },
      }),
    ]);

  return {
    users,
    proUsers,
    freeUsers: users - proUsers,
    wallets,
    products,
    webhooks,
    paymentsConfirmed,
    revenueByAsset: grouped.map((g) => ({
      asset: g.assetCode,
      total: g._sum.amount?.toString() ?? "0",
    })),
  };
}

type UserRow = Prisma.UserModel & {
  _count: { wallets: number; products: number; webhooks: number; payments: number };
};

function toDTO(u: UserRow): AdminUserDTO {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    plan: u.plan,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    counts: {
      wallets: u._count.wallets,
      products: u._count.products,
      webhooks: u._count.webhooks,
      payments: u._count.payments,
    },
  };
}

export interface ListUsersResult {
  users: AdminUserDTO[];
  meta: PageMeta;
}

export async function listUsers(
  params: PageParams,
  search?: string,
): Promise<ListUsersResult> {
  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { _count: { select: { wallets: true, products: true, webhooks: true, payments: true } } },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.user.count({ where }),
  ]);

  return { users: rows.map(toDTO), meta: buildPageMeta(params, total) };
}

async function findUser(userId: string): Promise<UserRow> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { wallets: true, products: true, webhooks: true, payments: true } } },
  });
  if (!user) throw Errors.notFound("User");
  return user;
}

export async function setUserPlan(userId: string, plan: Plan): Promise<AdminUserDTO> {
  await findUser(userId);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan },
    include: { _count: { select: { wallets: true, products: true, webhooks: true, payments: true } } },
  });
  return toDTO(user);
}

export async function setUserRole(userId: string, role: Role): Promise<AdminUserDTO> {
  await findUser(userId);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    include: { _count: { select: { wallets: true, products: true, webhooks: true, payments: true } } },
  });
  return toDTO(user);
}

export async function deleteUser(adminId: string, userId: string): Promise<void> {
  if (adminId === userId) throw Errors.badRequest("You can't delete your own account here");
  await findUser(userId);
  await prisma.user.delete({ where: { id: userId } });
}
