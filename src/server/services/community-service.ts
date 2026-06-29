import "server-only";

import { prisma } from "@/server/db/prisma";
import { Errors } from "@/server/http/errors";
import { buildPageMeta, type PageMeta, type PageParams } from "@/lib/pagination";
import {
  createQuestionSchema,
  createCommentSchema,
  type CreateQuestionInput,
  type CreateCommentInput,
} from "@/features/community/schemas";
import {
  type QuestionDTO,
  type QuestionDetailDTO,
  type CommentDTO,
} from "@/features/community/types";
import { type Prisma } from "@/generated/prisma/client";

type UserRef = { name: string | null; email: string };

function authorName(user: UserRef): string {
  return user.name?.trim() || user.email.split("@")[0];
}

const questionInclude = {
  user: { select: { name: true, email: true } },
  _count: { select: { comments: true } },
} as const;

type QuestionRow = Prisma.QuestionModel & {
  user: UserRef;
  _count: { comments: number };
};

function toQuestionDTO(q: QuestionRow, currentUserId: string | null): QuestionDTO {
  return {
    id: q.id,
    title: q.title,
    body: q.body,
    category: q.category,
    resolved: q.resolved,
    author: { name: authorName(q.user) },
    commentCount: q._count.comments,
    isAuthor: currentUserId !== null && q.userId === currentUserId,
    createdAt: q.createdAt.toISOString(),
  };
}

export interface ListQuestionsResult {
  questions: QuestionDTO[];
  meta: PageMeta;
}

export async function listQuestions(
  currentUserId: string | null,
  params: PageParams,
  opts: { category?: string; search?: string; resolved?: boolean } = {},
): Promise<ListQuestionsResult> {
  const where: Prisma.QuestionWhereInput = {
    ...(opts.category ? { category: opts.category } : {}),
    ...(opts.resolved !== undefined ? { resolved: opts.resolved } : {}),
    ...(opts.search
      ? {
          OR: [
            { title: { contains: opts.search, mode: "insensitive" } },
            { body: { contains: opts.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: questionInclude,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    }),
    prisma.question.count({ where }),
  ]);

  return {
    questions: rows.map((q) => toQuestionDTO(q, currentUserId)),
    meta: buildPageMeta(params, total),
  };
}

export async function getQuestion(
  currentUserId: string | null,
  id: string,
): Promise<QuestionDetailDTO> {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      ...questionInclude,
      comments: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!question) throw Errors.notFound("Question");

  const comments: CommentDTO[] = question.comments.map((c) => ({
    id: c.id,
    body: c.body,
    author: { name: authorName(c.user) },
    isAuthor: c.userId === currentUserId,
    createdAt: c.createdAt.toISOString(),
  }));

  return { ...toQuestionDTO(question, currentUserId), comments };
}

export async function createQuestion(
  userId: string,
  input: CreateQuestionInput,
): Promise<QuestionDTO> {
  const data = createQuestionSchema.parse(input);
  const question = await prisma.question.create({
    data: { userId, ...data },
    include: questionInclude,
  });
  return toQuestionDTO(question, userId);
}

export async function addComment(
  userId: string,
  questionId: string,
  input: CreateCommentInput,
): Promise<CommentDTO> {
  const data = createCommentSchema.parse(input);
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!question) throw Errors.notFound("Question");

  const comment = await prisma.communityComment.create({
    data: { userId, questionId, body: data.body },
    include: { user: { select: { name: true, email: true } } },
  });
  return {
    id: comment.id,
    body: comment.body,
    author: { name: authorName(comment.user) },
    isAuthor: true,
    createdAt: comment.createdAt.toISOString(),
  };
}

async function assertQuestionAuthor(userId: string, id: string): Promise<void> {
  const question = await prisma.question.findUnique({ where: { id }, select: { userId: true } });
  if (!question) throw Errors.notFound("Question");
  if (question.userId !== userId) throw Errors.forbidden("Only the author can do that");
}

export async function setResolved(
  userId: string,
  id: string,
  resolved: boolean,
): Promise<QuestionDTO> {
  await assertQuestionAuthor(userId, id);
  const question = await prisma.question.update({
    where: { id },
    data: { resolved },
    include: questionInclude,
  });
  return toQuestionDTO(question, userId);
}

export async function deleteQuestion(userId: string, id: string): Promise<void> {
  await assertQuestionAuthor(userId, id);
  await prisma.question.delete({ where: { id } });
}

export async function deleteComment(userId: string, id: string): Promise<void> {
  const comment = await prisma.communityComment.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!comment) throw Errors.notFound("Comment");
  if (comment.userId !== userId) throw Errors.forbidden("Only the author can delete this comment");
  await prisma.communityComment.delete({ where: { id } });
}
