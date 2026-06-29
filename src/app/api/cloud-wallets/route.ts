import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listCloudWallets, createCloudWallet } from "@/server/services/cloud-wallet-service";
import { createCloudWalletSchema } from "@/features/cloud-wallets/schemas";
import { ok, created, handleApiError } from "@/server/http/api-response";

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await listCloudWallets(user.id, await getModeNetwork()));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const input = createCloudWalletSchema.parse(await req.json());
    return created(await createCloudWallet(user.id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
