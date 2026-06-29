import { type Metadata } from "next";
import { MessagesSquare } from "lucide-react";

import { getCurrentUser } from "@/server/auth/guards";
import { listQuestions } from "@/server/services/community-service";
import { parsePageParams } from "@/lib/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { AskQuestionDialog } from "@/features/community/components/ask-question-dialog";
import { CategoryFilter } from "@/features/community/components/category-filter";
import { QuestionCard } from "@/features/community/components/question-card";
import { SignInPrompt } from "@/features/community/components/sign-in-prompt";

export const metadata: Metadata = { title: "Community" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const user = await getCurrentUser();
  const { page, category } = await searchParams;
  const params = parsePageParams({ page });
  const { questions, meta } = await listQuestions(user?.id ?? null, params, { category });

  const pageQuery = category ? `&category=${category}` : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
          <p className="text-muted-foreground">
            Open questions about the platform — payments, webhooks, the API, and more.
          </p>
        </div>
        {user && <AskQuestionDialog />}
      </div>

      {!user && <SignInPrompt action="ask a question or comment" />}

      <CategoryFilter active={category} />

      {questions.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title={category ? "No questions here yet" : "No questions yet"}
          description="Be the first to ask — anything about payments, webhooks, the API, or your account."
          action={user ? <AskQuestionDialog /> : undefined}
        />
      ) : (
        <>
          <div className="space-y-3">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
          <Pagination
            meta={meta}
            prevHref={`/community?page=${meta.page - 1}${pageQuery}`}
            nextHref={`/community?page=${meta.page + 1}${pageQuery}`}
          />
        </>
      )}
    </div>
  );
}
