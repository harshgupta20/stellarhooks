import { type NextRequest } from "next/server";

import { requireUser } from "@/server/auth/guards";
import { addComment } from "@/server/services/community-service";
import { createCommentSchema } from "@/features/community/schemas";
import { created, handleApiError } from "@/server/http/api-response";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const input = createCommentSchema.parse(await req.json());
    return created(await addComment(user.id, id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
