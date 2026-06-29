import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { listEvents } from "@/server/services/event-service";
import { parsePageParams } from "@/lib/pagination";
import { ok, handleApiError } from "@/server/http/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;
    const params = parsePageParams({ page: sp.get("page"), pageSize: sp.get("pageSize") });
    const walletId = sp.get("walletId") ?? undefined;
    const { events, meta } = await listEvents(user.id, params, { walletId });
    return ok(events, { meta });
  } catch (error) {
    return handleApiError(error);
  }
}
