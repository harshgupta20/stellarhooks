import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { getWebhook, updateWebhook, deleteWebhook } from "@/server/services/webhook-service";
import { updateWebhookSchema } from "@/features/webhooks/schemas";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await getWebhook(user.id, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = updateWebhookSchema.parse(await req.json());
    return ok(await updateWebhook(user.id, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteWebhook(user.id, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
