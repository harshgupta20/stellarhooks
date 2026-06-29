import { type NextRequest } from "next/server";

import { resolveUserId } from "@/server/auth/api-auth";
import { getProduct, updateProduct, deleteProduct } from "@/server/services/product-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    return ok(await getProduct(userId, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    return ok(await updateProduct(userId, id, await req.json()));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = await resolveUserId(req);
    const { id } = await params;
    await deleteProduct(userId, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
