import { type NextRequest } from "next/server";

import { resolveContext } from "@/server/auth/api-auth";
import { listPayments } from "@/server/services/payment-service";
import { parsePageParams } from "@/lib/pagination";
import { ok, handleApiError } from "@/server/http/api-response";
import { type PaymentStatus } from "@/generated/prisma/enums";

const STATUSES: PaymentStatus[] = ["PENDING", "CONFIRMED", "FAILED"];

export async function GET(req: NextRequest) {
  try {
    const { userId, network } = await resolveContext(req);
    const sp = req.nextUrl.searchParams;
    const params = parsePageParams({ page: sp.get("page"), pageSize: sp.get("pageSize") });

    const statusParam = sp.get("status")?.toUpperCase();
    const status = STATUSES.includes(statusParam as PaymentStatus)
      ? (statusParam as PaymentStatus)
      : undefined;

    const { payments, meta } = await listPayments(userId, params, {
      status,
      productId: sp.get("productId") ?? undefined,
      network,
      sortOrder: sp.get("sortOrder") === "asc" ? "asc" : "desc",
    });
    return ok(payments, { meta });
  } catch (error) {
    return handleApiError(error);
  }
}
