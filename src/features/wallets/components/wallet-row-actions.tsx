"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { WalletEditDialog } from "@/features/wallets/components/wallet-edit-dialog";
import { type WalletDTO } from "@/features/wallets/types";

export function WalletRowActions({ wallet }: { wallet: WalletDTO }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const onDelete = async () => {
    try {
      await apiFetch(`/api/wallets/${wallet.id}`, { method: "DELETE" });
      toast.success("Wallet deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not delete wallet");
      throw error;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Wallet actions">
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
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            }
            title="Delete wallet?"
            description={`This removes "${wallet.name}" and all of its events. This cannot be undone.`}
            confirmLabel="Delete"
            destructive
            onConfirm={onDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <WalletEditDialog wallet={wallet} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
