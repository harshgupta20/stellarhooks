import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { rotateSecret } from "@/server/services/webhook-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await rotateSecret(user.id, id));
  } catch (error) {
    return handleApiError(error);
  }
}
