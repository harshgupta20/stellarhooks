import Link from "next/link";
import { MessageSquare, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import { CategoryBadge } from "@/features/community/components/category-badge";
import { type QuestionDTO } from "@/features/community/types";

export function QuestionCard({ question }: { question: QuestionDTO }) {
  return (
    <Card className="p-4 transition-colors hover:bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <Link
            href={`/community/${question.id}`}
            className="line-clamp-1 font-medium hover:underline"
          >
            {question.title}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{question.body}</p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-muted-foreground">
            <CategoryBadge category={question.category} />
            <span>·</span>
            <span>{question.author.name}</span>
            <span>·</span>
            <span>{formatRelativeTime(question.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {question.resolved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              <CheckCircle2 className="size-3" />
              Resolved
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="size-3.5" />
            {question.commentCount}
          </span>
        </div>
      </div>
    </Card>
  );
}
