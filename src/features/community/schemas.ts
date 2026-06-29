import { z } from "zod";

import { COMMUNITY_CATEGORY_VALUES } from "@/lib/constants";

export const createQuestionSchema = z.object({
  title: z.string().trim().min(8, "Give your question a clear title").max(140),
  body: z.string().trim().min(15, "Add a bit more detail").max(4000),
  category: z.enum(COMMUNITY_CATEGORY_VALUES),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment can't be empty").max(2000),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
