"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { apiFetch, ApiClientError } from "@/lib/api-client";

export function RevokeApiKeyButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  const onRevoke = async () => {
    try {
      await apiFetch(`/api/api-keys/${id}`, { method: "DELETE" });
      toast.success("API key revoked");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not revoke key");
      throw error;
    }
  };

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          aria-label="Revoke key"
        >
          <Trash2 className="size-4" />
        </Button>
      }
      title="Revoke API key?"
      description={`"${name}" will stop working immediately for any SDK or API client using it.`}
      confirmLabel="Revoke"
      destructive
      onConfirm={onRevoke}
    />
  );
}
