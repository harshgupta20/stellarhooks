import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listWallets, createWallet } from "@/server/services/wallet-service";
import { createWalletSchema } from "@/features/wallets/schemas";
import { ok, created, handleApiError } from "@/server/http/api-response";

export async function GET() {
  try {
    const user = await requireUser();
    const wallets = await listWallets(user.id, await getModeNetwork());
    return ok(wallets);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const input = createWalletSchema.parse(body);
    const wallet = await createWallet(user.id, input);
    return created(wallet);
  } catch (error) {
    return handleApiError(error);
  }
}
