import { type NextRequest } from "next/server";

import { resolveUserId } from "@/server/auth/api-auth";
import { getPayment } from "@/server/services/payment-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    return ok(await getPayment(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}
