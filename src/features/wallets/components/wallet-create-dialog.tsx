"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { type Network } from "@/lib/constants";
import { createWalletSchema, type CreateWalletInput } from "@/features/wallets/schemas";
import { type WalletDTO } from "@/features/wallets/types";

export function WalletCreateDialog({ network }: { network: Network }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateWalletInput>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: { name: "", address: "", network },
  });

  const onSubmit = async (values: CreateWalletInput) => {
    setSubmitting(true);
    try {
      await apiFetch<WalletDTO>("/api/wallets", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Wallet added");
      setOpen(false);
      form.reset({ name: "", address: "", network });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not add wallet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add wallet</DialogTitle>
          <DialogDescription>Watch a Stellar address for incoming payments.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Treasury wallet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stellar address</FormLabel>
                  <FormControl>
                    <Input placeholder="GABC…" className="font-mono text-sm" {...field} />
                  </FormControl>
                  <FormDescription>The public key (G…) you want to monitor.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <div>
                <p className="text-sm font-medium">Network</p>
                <p className="text-xs text-muted-foreground">
                  Set by your dashboard mode — switch it in the header.
                </p>
              </div>
              <Badge variant={network === "PUBLIC" ? "default" : "secondary"}>
                {network === "PUBLIC" ? "Mainnet" : "Testnet"}
              </Badge>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Add wallet
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
