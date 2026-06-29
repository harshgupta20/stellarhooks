import "server-only";

import { type NextRequest } from "next/server";

import { auth } from "@/server/auth/auth";
import { verifyApiKey } from "@/server/services/apikey-service";
import { getModeNetwork } from "@/server/mode";
import { Errors } from "@/server/http/errors";
import { rateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS, type Network } from "@/lib/constants";

function extractApiKey(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);
    if (token.startsWith("sk_")) return token;
  }
  const xApiKey = req.headers.get("x-api-key");
  if (xApiKey?.startsWith("sk_")) return xApiKey;
  return null;
}

export interface AuthContext {
  userId: string;
  /**
   * The network the request operates on. From the API key for key auth, or the
   * dashboard mode cookie for session auth.
   */
  network: Network;
}

/**
 * Resolve the acting user and network for a public API request. Accepts an API
 * key (Authorization: Bearer sk_… or x-api-key) or a dashboard session cookie.
 * Throws 401 when neither is valid, 429 when rate limited.
 */
export async function resolveContext(req: NextRequest): Promise<AuthContext> {
  let userId: string | null = null;
  let network: Network | null = null;

  const apiKey = extractApiKey(req);
  if (apiKey) {
    const result = await verifyApiKey(apiKey);
    if (!result) throw Errors.unauthorized("Invalid API key");
    userId = result.userId;
    network = result.network;
  } else {
    const session = await auth();
    userId = session?.user?.id ?? null;
    if (userId) network = await getModeNetwork();
  }

  if (!userId || !network) throw Errors.unauthorized("Provide a valid API key or sign in");

  const { limit, windowMs } = RATE_LIMITS.api;
  const result = rateLimit(`api:${userId}`, limit, windowMs);
  if (!result.ok) {
    throw Errors.tooManyRequests(
      `Rate limit exceeded (${limit} requests/min). Retry in ${result.retryAfterSec}s.`,
    );
  }

  return { userId, network };
}

/** Convenience for endpoints that only need the user id. */
export async function resolveUserId(req: NextRequest): Promise<string> {
  return (await resolveContext(req)).userId;
}
