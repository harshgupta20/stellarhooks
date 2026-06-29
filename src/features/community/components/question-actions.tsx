"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { apiFetch, ApiClientError } from "@/lib/api-client";

export function QuestionActions({
  questionId,
  resolved,
}: {
  questionId: string;
  resolved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleResolved = async () => {
    setBusy(true);
    try {
      await apiFetch(`/api/community/questions/${questionId}`, {
        method: "PATCH",
        body: JSON.stringify({ resolved: !resolved }),
      });
      toast.success(resolved ? "Marked unresolved" : "Marked resolved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not update");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    try {
      await apiFetch(`/api/community/questions/${questionId}`, { method: "DELETE" });
      toast.success("Question deleted");
      router.push("/community");
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not delete");
      throw error;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={toggleResolved} disabled={busy}>
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : resolved ? (
          <Circle className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {resolved ? "Mark unresolved" : "Mark resolved"}
      </Button>
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        }
        title="Delete question?"
        description="This permanently removes the question and all its comments."
        confirmLabel="Delete"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
