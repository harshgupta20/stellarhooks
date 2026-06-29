import { type NextRequest } from "next/server";

import { resolveContext } from "@/server/auth/api-auth";
import { listWebhooks, createWebhook } from "@/server/services/webhook-service";
import { ok, created, handleApiError } from "@/server/http/api-response";

export async function GET(req: NextRequest) {
  try {
    const { userId, network } = await resolveContext(req);
    return ok(await listWebhooks(userId, network));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, network } = await resolveContext(req);
    return created(await createWebhook(userId, await req.json(), network));
  } catch (error) {
    return handleApiError(error);
  }
}
