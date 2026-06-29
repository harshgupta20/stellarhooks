import { type NextRequest } from "next/server";
import { z } from "zod";

import { requireUser, getCurrentUser } from "@/server/auth/guards";
import { getQuestion, setResolved, deleteQuestion } from "@/server/services/community-service";
import { ok, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({ resolved: z.boolean() });

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    return ok(await getQuestion(user?.id ?? null, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { resolved } = patchSchema.parse(await req.json());
    return ok(await setResolved(user.id, id, resolved));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteQuestion(user.id, id);
    return ok({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
