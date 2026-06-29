import "server-only";

import { auth } from "./auth";
import { Errors } from "@/server/http/errors";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Resolve the current session user or throw a 401. Use inside route handlers
 * wrapped by handleApiError.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw Errors.unauthorized();
  }
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
  };
}

/** Like requireUser but returns null instead of throwing. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
  };
}
