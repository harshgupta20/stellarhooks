import { type NextRequest } from "next/server";
import { z } from "zod";

import { resolveContext, resolveUserId } from "@/server/auth/api-auth";
import { listPaymentLinks, createPaymentLink } from "@/server/services/payment-link-service";
import { parsePageParams } from "@/lib/pagination";
import { ok, created, handleApiError } from "@/server/http/api-response";

const createSchema = z.object({ productId: z.string().min(1, "productId is required") });

export async function GET(req: NextRequest) {
  try {
    const { userId, network } = await resolveContext(req);
    const sp = req.nextUrl.searchParams;
    const params = parsePageParams({ page: sp.get("page"), pageSize: sp.get("pageSize") });
    const activeParam = sp.get("active");

    const { links, meta } = await listPaymentLinks(userId, params, {
      productId: sp.get("productId") ?? undefined,
      active: activeParam === null ? undefined : activeParam === "true",
      network,
    });
    return ok(links, { meta });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    const { productId } = createSchema.parse(await req.json());
    return created(await createPaymentLink(userId, productId));
  } catch (error) {
    return handleApiError(error);
  }
}
