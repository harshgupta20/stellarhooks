import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { replayDelivery } from "@/server/services/delivery-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await replayDelivery(user.id, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
