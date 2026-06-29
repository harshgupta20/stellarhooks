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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { type Network } from "@/lib/constants";
import {
  createCloudWalletSchema,
  type CreateCloudWalletInput,
} from "@/features/cloud-wallets/schemas";
import { type CloudWalletWithSecretDTO } from "@/features/cloud-wallets/types";
import { WalletSecretDialog } from "@/features/cloud-wallets/components/wallet-secret-dialog";

export function CloudWalletCreateDialog({ network }: { network: Network }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealed, setRevealed] = useState<{ publicKey: string; secret: string } | null>(null);

  const form = useForm<CreateCloudWalletInput>({
    resolver: zodResolver(createCloudWalletSchema),
    defaultValues: { name: "", network },
  });

  const onSubmit = async (values: CreateCloudWalletInput) => {
    setSubmitting(true);
    try {
      const wallet = await apiFetch<CloudWalletWithSecretDTO>("/api/cloud-wallets", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success("Cloud wallet created");
      setOpen(false);
      form.reset({ name: "", network });
      setRevealed({ publicKey: wallet.publicKey, secret: wallet.secret });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not create wallet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="size-4" />
            Create wallet
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create cloud wallet</DialogTitle>
            <DialogDescription>
              We generate a new Stellar keypair and store the secret encrypted so you can manage
              it here.
            </DialogDescription>
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
                      <Input placeholder="My cloud wallet" {...field} />
                    </FormControl>
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
                  Create wallet
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <WalletSecretDialog
        publicKey={revealed?.publicKey ?? ""}
        secret={revealed?.secret ?? null}
        open={revealed !== null}
        onOpenChange={(o) => {
          if (!o) setRevealed(null);
        }}
      />
    </>
  );
}
