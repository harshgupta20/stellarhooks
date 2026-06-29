"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { apiFetch, ApiClientError } from "@/lib/api-client";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();

  const onDelete = async () => {
    try {
      await apiFetch(`/api/community/comments/${commentId}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not delete comment");
      throw error;
    }
  };

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          aria-label="Delete comment"
        >
          <Trash2 className="size-3.5" />
        </Button>
      }
      title="Delete comment?"
      description="This permanently removes your comment."
      confirmLabel="Delete"
      destructive
      onConfirm={onDelete}
    />
  );
}
