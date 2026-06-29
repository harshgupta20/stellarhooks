"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { sendPaymentSchema, type SendPaymentInput } from "@/features/cloud-wallets/schemas";
import {
  type CloudWalletDTO,
  type SendPaymentResult,
  type DestinationStatus,
} from "@/features/cloud-wallets/types";

function explorerTxUrl(network: CloudWalletDTO["network"], hash: string): string {
  const net = network === "PUBLIC" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${net}/tx/${hash}`;
}

function networkLabel(network: CloudWalletDTO["network"]): string {
  return network === "PUBLIC" ? "Public (Mainnet)" : "Testnet";
}

function DestinationHint({
  status,
  checking,
  networkName,
}: {
  status: DestinationStatus | null;
  checking: boolean;
  networkName: string;
}) {
  if (checking) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" /> Checking address on {networkName}…
      </p>
    );
  }
  if (!status || !status.valid) return null;
  if (status.isSelf) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-destructive">
        <AlertTriangle className="size-3" /> This is the source wallet — pick a different
        destination.
      </p>
    );
  }
  if (status.exists === true) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-success">
        <CheckCircle2 className="size-3" /> Account exists on {networkName}.
      </p>
    );
  }
  if (status.exists === false) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-warning">
        <AlertTriangle className="size-3" /> Not on {networkName} yet — your payment will create
        this account (needs at least 1 XLM).
      </p>
    );
  }
  return (
    <p className="text-xs text-muted-foreground">Couldn&apos;t verify the address on {networkName}.</p>
  );
}

export function SendPaymentDialog({
  wallet,
  open,
  onOpenChange,
}: {
  wallet: CloudWalletDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [destStatus, setDestStatus] = useState<DestinationStatus | null>(null);
  const [checking, setChecking] = useState(false);

  const form = useForm<SendPaymentInput>({
    resolver: zodResolver(sendPaymentSchema),
    defaultValues: { destination: "", amount: "", memo: "" },
  });

  const destinationValue = useWatch({ control: form.control, name: "destination" });
  const destination = (destinationValue ?? "").trim();

  // Debounced check of the destination against the wallet's network.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (destination.length !== 56) {
        if (!cancelled) {
          setDestStatus(null);
          setChecking(false);
        }
        return;
      }
      if (!cancelled) setChecking(true);
      try {
        const status = await apiFetch<DestinationStatus>(
          `/api/cloud-wallets/${wallet.id}/destination-check?address=${encodeURIComponent(destination)}`,
        );
        if (!cancelled) setDestStatus(status);
      } catch {
        if (!cancelled) setDestStatus(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [destination, open, wallet.id]);

  const onSubmit = async (values: SendPaymentInput) => {
    setSubmitting(true);
    try {
      const result = await apiFetch<SendPaymentResult>(
        `/api/cloud-wallets/${wallet.id}/payments`,
        { method: "POST", body: JSON.stringify(values) },
      );
      toast.success("Payment sent", {
        description: "View transaction",
        action: {
          label: "Explorer",
          onClick: () => window.open(explorerTxUrl(wallet.network, result.hash), "_blank"),
        },
      });
      onOpenChange(false);
      form.reset({ destination: "", amount: "", memo: "" });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not send payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send XLM</DialogTitle>
          <DialogDescription>
            Send a native XLM payment from <span className="font-medium">{wallet.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span>This payment executes on</span>
          <Badge variant="secondary">{networkLabel(wallet.network)}</Badge>
          <span>— it can only reach accounts on that network.</span>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination address</FormLabel>
                  <FormControl>
                    <Input placeholder="GABC…" className="font-mono text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                  <DestinationHint
                    status={destStatus}
                    checking={checking}
                    networkName={networkLabel(wallet.network)}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (XLM)</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memo (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Invoice #123" {...field} />
                  </FormControl>
                  <FormDescription>Text memo, up to 28 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Send payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
