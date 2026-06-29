import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { getWallet, updateWallet, deleteWallet } from "@/server/services/wallet-service";
import { updateWalletSchema } from "@/features/wallets/schemas";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const wallet = await getWallet(user.id, id);
    return ok(wallet);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const input = updateWalletSchema.parse(body);
    const wallet = await updateWallet(user.id, id, input);
    return ok(wallet);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteWallet(user.id, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
