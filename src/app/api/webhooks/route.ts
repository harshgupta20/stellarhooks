import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listWebhooks, createWebhook } from "@/server/services/webhook-service";
import { createWebhookSchema } from "@/features/webhooks/schemas";
import { ok, created, handleApiError } from "@/server/http/api-response";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listWebhooks(user.id, await getModeNetwork()));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const input = createWebhookSchema.parse(await req.json());
    return created(await createWebhook(user.id, input, await getModeNetwork()));
  } catch (error) {
    return handleApiError(error);
  }
}
