import { type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/server/auth/admin";
import { setUserPlan, setUserRole, deleteUser } from "@/server/services/admin-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z
  .object({
    plan: z.enum(["FREE", "PRO", "SCALE"]).optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
  })
  .refine((d) => d.plan !== undefined || d.role !== undefined, "Provide plan or role");

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = patchSchema.parse(await req.json());
    let result;
    if (data.plan) result = await setUserPlan(id, data.plan);
    if (data.role) result = await setUserRole(id, data.role);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    await deleteUser(admin.id, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
