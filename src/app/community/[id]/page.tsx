import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageSquare } from "lucide-react";

import { getCurrentUser } from "@/server/auth/guards";
import { getQuestion } from "@/server/services/community-service";
import { ApiError } from "@/server/http/errors";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/features/community/components/category-badge";
import { QuestionActions } from "@/features/community/components/question-actions";
import { CommentForm } from "@/features/community/components/comment-form";
import { DeleteCommentButton } from "@/features/community/components/delete-comment-button";
import { SignInPrompt } from "@/features/community/components/sign-in-prompt";

export const metadata: Metadata = { title: "Question" };

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  let question;
  try {
    question = await getQuestion(user?.id ?? null, id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Community
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={question.category} />
          {question.resolved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              <CheckCircle2 className="size-3" />
              Resolved
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{question.title}</h1>
        <p className="text-sm text-muted-foreground">
          {question.author.name} · {formatRelativeTime(question.createdAt)}
        </p>
        <p className="whitespace-pre-wrap text-[15px] leading-7">{question.body}</p>

        {question.isAuthor && (
          <QuestionActions questionId={question.id} resolved={question.resolved} />
        )}
      </div>

      <div className="space-y-4 border-t pt-6">
        <h2 className="flex items-center gap-2 text-base font-medium">
          <MessageSquare className="size-4" />
          {question.commentCount} {question.commentCount === 1 ? "comment" : "comments"}
        </h2>

        {question.comments.length > 0 && (
          <ul className="space-y-3">
            {question.comments.map((comment) => (
              <li key={comment.id}>
                <Card>
                  <CardContent className="py-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{comment.author.name}</span> ·{" "}
                        {formatRelativeTime(comment.createdAt)}
                      </p>
                      {comment.isAuthor && <DeleteCommentButton commentId={comment.id} />}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6">{comment.body}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {user ? (
          <CommentForm questionId={question.id} />
        ) : (
          <SignInPrompt action="comment" />
        )}
      </div>
    </div>
  );
}
