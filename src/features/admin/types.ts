import { type Plan, type Role } from "@/generated/prisma/enums";

export interface PlatformStats {
  users: number;
  proUsers: number;
  freeUsers: number;
  wallets: number;
  products: number;
  webhooks: number;
  paymentsConfirmed: number;
  revenueByAsset: { asset: string; total: string }[];
}

export interface AdminUserDTO {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  role: Role;
  createdAt: string;
  counts: {
    wallets: number;
    products: number;
    webhooks: number;
    payments: number;
  };
}
