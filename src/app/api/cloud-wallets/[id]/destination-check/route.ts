import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { checkDestination } from "@/server/services/cloud-wallet-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const address = req.nextUrl.searchParams.get("address") ?? "";
    return ok(await checkDestination(user.id, id, address));
  } catch (error) {
    return handleApiError(error);
  }
}
