import { type NextRequest } from "next/server";

import { requireUser, getCurrentUser } from "@/server/auth/guards";
import { listQuestions, createQuestion } from "@/server/services/community-service";
import { createQuestionSchema } from "@/features/community/schemas";
import { parsePageParams } from "@/lib/pagination";
import { ok, created, handleApiError } from "@/server/http/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sp = req.nextUrl.searchParams;
    const params = parsePageParams({ page: sp.get("page"), pageSize: sp.get("pageSize") });
    const resolvedParam = sp.get("resolved");

    const { questions, meta } = await listQuestions(user?.id ?? null, params, {
      category: sp.get("category") ?? undefined,
      search: sp.get("search") ?? undefined,
      resolved: resolvedParam === null ? undefined : resolvedParam === "true",
    });
    return ok(questions, { meta });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const input = createQuestionSchema.parse(await req.json());
    return created(await createQuestion(user.id, input));
  } catch (error) {
    return handleApiError(error);
  }
}
