import { type NextRequest } from "next/server";

import { resolveUserId } from "@/server/auth/api-auth";
import { getWebhook, updateWebhook, deleteWebhook } from "@/server/services/webhook-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    return ok(await getWebhook(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    return ok(await updateWebhook(userId, id, await req.json()));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    await deleteWebhook(userId, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
