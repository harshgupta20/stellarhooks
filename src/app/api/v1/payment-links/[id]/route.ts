import { type NextRequest } from "next/server";
import { z } from "zod";

import { resolveUserId } from "@/server/auth/api-auth";
import {
  getPaymentLink,
  setPaymentLinkActive,
  deletePaymentLink,
} from "@/server/services/payment-link-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({ active: z.boolean() });

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    return ok(await getPaymentLink(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    const { active } = patchSchema.parse(await req.json());
    return ok(await setPaymentLinkActive(userId, id, active));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    await deletePaymentLink(userId, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
