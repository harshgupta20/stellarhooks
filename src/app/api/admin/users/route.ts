import { type NextRequest } from "next/server";

import { requireAdmin } from "@/server/auth/admin";
import { listUsers } from "@/server/services/admin-service";
import { parsePageParams } from "@/lib/pagination";
import { ok, handleApiError } from "@/server/http/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const sp = req.nextUrl.searchParams;
    const params = parsePageParams({ page: sp.get("page"), pageSize: sp.get("pageSize") });
    const { users, meta } = await listUsers(params, sp.get("search") ?? undefined);
    return ok(users, { meta });
  } catch (error) {
    return handleApiError(error);
  }
}
