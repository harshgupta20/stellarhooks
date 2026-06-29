import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { listDeliveries } from "@/server/services/delivery-service";
import { parsePageParams } from "@/lib/pagination";
import { ok, handleApiError } from "@/server/http/api-response";
import { type DeliveryStatus } from "@/generated/prisma/enums";

const VALID_STATUSES: DeliveryStatus[] = ["PENDING", "SUCCESS", "FAILED", "EXHAUSTED"];

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const sp = req.nextUrl.searchParams;
    const params = parsePageParams({ page: sp.get("page"), pageSize: sp.get("pageSize") });

    const statusParam = sp.get("status");
    const status = VALID_STATUSES.includes(statusParam as DeliveryStatus)
      ? (statusParam as DeliveryStatus)
      : undefined;

    const { deliveries, meta } = await listDeliveries(user.id, params, { status });
    return ok(deliveries, { meta });
  } catch (error) {
    return handleApiError(error);
  }
}
