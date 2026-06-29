import { type NextRequest } from "next/server";

import { resolveContext, resolveUserId } from "@/server/auth/api-auth";
import { listProducts, createProduct } from "@/server/services/product-service";
import { parsePageParams } from "@/lib/pagination";
import { ok, created, handleApiError } from "@/server/http/api-response";

export async function GET(req: NextRequest) {
  try {
    const { userId, network } = await resolveContext(req);
    const sp = req.nextUrl.searchParams;
    const params = parsePageParams({ page: sp.get("page"), pageSize: sp.get("pageSize") });

    const activeParam = sp.get("active");
    const sortBy = sp.get("sortBy") === "name" ? "name" : "createdAt";
    const sortOrder = sp.get("sortOrder") === "asc" ? "asc" : "desc";

    const { products, meta } = await listProducts(userId, params, {
      active: activeParam === null ? undefined : activeParam === "true",
      search: sp.get("search") ?? undefined,
      network,
      sortBy,
      sortOrder,
    });
    return ok(products, { meta });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    return created(await createProduct(userId, await req.json()));
  } catch (error) {
    return handleApiError(error);
  }
}
