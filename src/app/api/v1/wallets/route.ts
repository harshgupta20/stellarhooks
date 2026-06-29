import { type NextRequest } from "next/server";

import { resolveContext, resolveUserId } from "@/server/auth/api-auth";
import { listWallets, createWallet } from "@/server/services/wallet-service";
import { ok, created, handleApiError } from "@/server/http/api-response";

export async function GET(req: NextRequest) {
  try {
    const { userId, network } = await resolveContext(req);
    return ok(await listWallets(userId, network));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    return created(await createWallet(userId, await req.json()));
  } catch (error) {
    return handleApiError(error);
  }
}
