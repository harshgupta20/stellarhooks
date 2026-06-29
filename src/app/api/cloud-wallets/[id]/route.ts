import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { getCloudWallet, deleteCloudWallet } from "@/server/services/cloud-wallet-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    return ok(await getCloudWallet(user.id, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteCloudWallet(user.id, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
