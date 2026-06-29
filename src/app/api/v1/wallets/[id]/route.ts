import { type NextRequest } from "next/server";

import { resolveUserId } from "@/server/auth/api-auth";
import { getWallet, updateWallet, deleteWallet } from "@/server/services/wallet-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    return ok(await getWallet(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    return ok(await updateWallet(userId, id, await req.json()));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    await deleteWallet(userId, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
