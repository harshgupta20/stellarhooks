"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { WebhookEditDialog } from "@/features/webhooks/components/webhook-edit-dialog";
import { SecretRevealDialog } from "@/features/webhooks/components/secret-reveal-dialog";
import { type WebhookDTO, type WebhookWithSecretDTO } from "@/features/webhooks/types";

export function WebhookRowActions({ webhook }: { webhook: WebhookDTO }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const onRotate = async () => {
    try {
      const updated = await apiFetch<WebhookWithSecretDTO>(
        `/api/webhooks/${webhook.id}/rotate-secret`,
        { method: "POST" },
      );
      toast.success("Secret rotated");
      setRevealedSecret(updated.secret);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not rotate secret");
      throw error;
    }
  };

  const onDelete = async () => {
    try {
      await apiFetch(`/api/webhooks/${webhook.id}`, { method: "DELETE" });
      toast.success("Webhook deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not delete webhook");
      throw error;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Webhook actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <ConfirmDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <RefreshCw className="size-4" />
                Rotate secret
              </DropdownMenuItem>
            }
            title="Rotate signing secret?"
            description="The current secret stops working immediately. You'll need to update your endpoint with the new one."
            confirmLabel="Rotate"
            onConfirm={onRotate}
          />
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            }
            title="Delete webhook?"
            description={`This removes "${webhook.name}" and its delivery history. This cannot be undone.`}
            confirmLabel="Delete"
            destructive
            onConfirm={onDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <WebhookEditDialog webhook={webhook} open={editOpen} onOpenChange={setEditOpen} />
      <SecretRevealDialog
        secret={revealedSecret}
        open={revealedSecret !== null}
        onOpenChange={(o) => {
          if (!o) setRevealedSecret(null);
        }}
      />
    </>
  );
}
