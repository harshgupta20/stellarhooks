"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
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
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { type ProductDTO } from "@/features/products/types";
import { type WalletDTO } from "@/features/wallets/types";

export function ProductRowActions({
  product,
  wallets,
}: {
  product: ProductDTO;
  wallets: WalletDTO[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const onDelete = async () => {
    try {
      await apiFetch(`/api/v1/products/${product.id}`, { method: "DELETE" });
      toast.success("Product deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not delete product");
      throw error;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Product actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/products/${product.id}`}>
              <ExternalLink className="size-4" />
              Open
            </Link>
          </DropdownMenuItem>
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
            title="Delete product?"
            description={`This removes "${product.name}" and its payment links. Products with payment history can't be deleted.`}
            confirmLabel="Delete"
            destructive
            onConfirm={onDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductFormDialog
        wallets={wallets}
        product={product}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
