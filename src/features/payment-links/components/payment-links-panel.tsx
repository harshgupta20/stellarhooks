"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Loader2, ExternalLink, Trash2, LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/copy-button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { type PaymentLinkDTO } from "@/features/payment-links/types";

export function PaymentLinksPanel({
  productId,
  links,
}: {
  productId: string;
  links: PaymentLinkDTO[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const create = async () => {
    setCreating(true);
    try {
      await apiFetch("/api/v1/payment-links", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      toast.success("Payment link created");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not create link");
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (id: string, active: boolean) => {
    try {
      await apiFetch(`/api/v1/payment-links/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not update link");
    }
  };

  const remove = async (id: string) => {
    try {
      await apiFetch(`/api/v1/payment-links/${id}`, { method: "DELETE" });
      toast.success("Payment link deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not delete link");
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Payment links</CardTitle>
        <Button size="sm" onClick={create} disabled={creating}>
          {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          New link
        </Button>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <EmptyState
            icon={LinkIcon}
            title="No payment links"
            description="Create a link to share a hosted payment page for this product."
          />
        ) : (
          <ul className="divide-y">
            {links.map((link) => (
              <li key={link.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <code className="truncate font-mono text-xs text-muted-foreground">
                      {link.url}
                    </code>
                    <CopyButton value={link.url} label="Copy link" />
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Open link"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    memo <code className="font-mono">{link.memo}</code>
                    <CopyButton value={link.memo} label="Copy memo" />· {link.paymentCount}{" "}
                    payment{link.paymentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={link.active}
                    onCheckedChange={(c) => toggle(link.id, c)}
                    aria-label="Toggle active"
                  />
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        aria-label="Delete link"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    }
                    title="Delete payment link?"
                    description="The hosted page will stop working. Payment history is kept."
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => remove(link.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
