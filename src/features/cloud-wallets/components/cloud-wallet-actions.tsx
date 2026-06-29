"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplet, Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { SendPaymentDialog } from "@/features/cloud-wallets/components/send-payment-dialog";
import { type CloudWalletDTO } from "@/features/cloud-wallets/types";

export function CloudWalletActions({
  wallet,
  afterDelete = "refresh",
  size = "sm",
}: {
  wallet: CloudWalletDTO;
  afterDelete?: "refresh" | "redirect";
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const [sendOpen, setSendOpen] = useState(false);
  const [funding, setFunding] = useState(false);

  const isTestnet = wallet.network === "TESTNET";

  const onFund = async () => {
    setFunding(true);
    try {
      await apiFetch(`/api/cloud-wallets/${wallet.id}/fund`, { method: "POST" });
      toast.success("Wallet funded with testnet XLM");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not fund wallet");
    } finally {
      setFunding(false);
    }
  };

  const onDelete = async () => {
    try {
      await apiFetch(`/api/cloud-wallets/${wallet.id}`, { method: "DELETE" });
      toast.success("Cloud wallet deleted");
      if (afterDelete === "redirect") router.push("/dashboard/cloud-wallets");
      else router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not delete wallet");
      throw error;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {isTestnet && (
        <Button variant="outline" size={size} onClick={onFund} disabled={funding}>
          {funding ? <Loader2 className="size-4 animate-spin" /> : <Droplet className="size-4" />}
          Fund
        </Button>
      )}
      <Button size={size} onClick={() => setSendOpen(true)} disabled={!wallet.funded}>
        <Send className="size-4" />
        Send
      </Button>
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size={size} className="text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
            Delete
          </Button>
        }
        title="Delete cloud wallet?"
        description="The encrypted secret is permanently removed. Any funds still in this wallet will be unrecoverable unless you saved the secret key. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={onDelete}
      />

      <SendPaymentDialog wallet={wallet} open={sendOpen} onOpenChange={setSendOpen} />
    </div>
  );
}
