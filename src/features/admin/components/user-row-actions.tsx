"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { type AdminUserDTO } from "@/features/admin/types";

export function UserRowActions({
  user,
  currentAdminId,
}: {
  user: AdminUserDTO;
  currentAdminId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isSelf = user.id === currentAdminId;

  const patch = async (body: Record<string, string>, msg: string) => {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify(body) });
      toast.success(msg);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      toast.success("User deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Delete failed");
      throw error;
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        value={user.plan}
        onValueChange={(v) => patch({ plan: v }, `Plan set to ${v}`)}
        disabled={busy}
      >
        <SelectTrigger className="h-8 w-32" aria-label="Plan">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FREE">Free</SelectItem>
          <SelectItem value="PRO">Pro</SelectItem>
          <SelectItem value="SCALE">Scale Startup</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={user.role}
        onValueChange={(v) => patch({ role: v }, `Role set to ${v}`)}
        disabled={busy}
      >
        <SelectTrigger className="h-8 w-28" aria-label="Role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USER">User</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>

      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            disabled={isSelf}
            aria-label="Delete user"
          >
            <Trash2 className="size-4" />
          </Button>
        }
        title={`Delete ${user.email}?`}
        description="This permanently deletes the user and ALL their data (wallets, products, payments, webhooks, keys). This cannot be undone."
        confirmLabel="Delete user"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
