import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { getEnv } from "@/lib/env";
import { Errors } from "@/server/http/errors";
import { type Role } from "@/generated/prisma/enums";

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

function adminEmails(): string[] {
  return getEnv()
    .ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** The current user if they are a platform admin (role ADMIN or in ADMIN_EMAILS), else null. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) return null;
  const isAdmin = user.role === "ADMIN" || adminEmails().includes(user.email.toLowerCase());
  return isAdmin ? user : null;
}

/** Page guard: redirect non-admins away from the founder console. */
export async function requireAdminPage(): Promise<AdminUser> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const admin = await getAdminUser();
  if (!admin) redirect("/dashboard");
  return admin;
}

/** API guard: throw 403 for non-admins. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw Errors.forbidden("Admin access required");
  return admin;
}
