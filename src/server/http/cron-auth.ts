import "server-only";

import { timingSafeEqual } from "node:crypto";
import { type NextRequest } from "next/server";

import { getEnv } from "@/lib/env";
import { Errors } from "@/server/http/errors";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Authorize a cron request via `Authorization: Bearer <CRON_SECRET>`.
 * Throws a 401 ApiError when missing or invalid.
 */
export function assertCronAuthorized(req: NextRequest): void {
  const { CRON_SECRET } = getEnv();
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token || !safeEqual(token, CRON_SECRET)) {
    throw Errors.unauthorized("Invalid or missing cron secret");
  }
}
