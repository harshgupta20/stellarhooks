"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { createProductSchema, type CreateProductInput } from "@/features/products/schemas";
import { type ProductDTO } from "@/features/products/types";
import { type WalletDTO } from "@/features/wallets/types";

function defaults(wallets: WalletDTO[], product?: ProductDTO): CreateProductInput {
  if (product) {
    return {
      name: product.name,
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? "",
      walletId: product.wallet.id,
      assetCode: product.assetCode,
      assetIssuer: product.assetIssuer ?? "",
      priceType: product.priceType,
      price: product.price ?? "",
      minAmount: product.minAmount ?? "",
      active: product.active,
    };
  }
  return {
    name: "",
    description: "",
    imageUrl: "",
    walletId: wallets[0]?.id ?? "",
    assetCode: "XLM",
    assetIssuer: "",
    priceType: "FIXED",
    price: "",
    minAmount: "",
    active: true,
  };
}

export function ProductFormDialog({
  wallets,
  product,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  wallets: WalletDTO[];
  product?: ProductDTO;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(product);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: defaults(wallets, product),
  });

  const priceType = useWatch({ control: form.control, name: "priceType" });
  const assetCode = useWatch({ control: form.control, name: "assetCode" });
  const isCustomAsset = (assetCode ?? "XLM").toUpperCase() !== "XLM";

  const onSubmit = async (values: CreateProductInput) => {
    setSubmitting(true);
    try {
      if (isEdit && product) {
        await apiFetch(`/api/v1/products/${product.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        toast.success("Product updated");
      } else {
        await apiFetch("/api/v1/products", { method: "POST", body: JSON.stringify(values) });
        toast.success("Product created");
        form.reset(defaults(wallets));
      }
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Could not save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "Create product"}</DialogTitle>
          <DialogDescription>
            Configure what customers pay and which wallet receives it.
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
                    <Input placeholder="Pro plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://… (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="walletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receiving wallet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a monitored wallet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name} ({w.network === "TESTNET" ? "Testnet" : "Public"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Payments must arrive here. Add one under Monitored Wallets first.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormItem>
                <FormLabel>Asset</FormLabel>
                <Select
                  value={isCustomAsset ? "custom" : "xlm"}
                  onValueChange={(v) => {
                    if (v === "xlm") {
                      form.setValue("assetCode", "XLM");
                      form.setValue("assetIssuer", "");
                    } else {
                      form.setValue("assetCode", "");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlm">XLM (native)</SelectItem>
                    <SelectItem value="custom">Custom asset</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
              <FormField
                control={form.control}
                name="priceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed price</SelectItem>
                        <SelectItem value="CUSTOM">Customer chooses</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {isCustomAsset && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="assetCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset code</FormLabel>
                      <FormControl>
                        <Input placeholder="USDC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assetIssuer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuer</FormLabel>
                      <FormControl>
                        <Input placeholder="G…" className="font-mono text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {priceType === "FIXED" ? (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum amount (optional)</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="1" {...field} />
                    </FormControl>
                    <FormDescription>Customers can pay any amount above this.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isEdit && (
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Inactive products stop accepting payments.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={submitting || wallets.length === 0}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
