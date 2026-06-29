/* eslint-disable @next/next/no-img-element */
import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Pencil } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { getProduct } from "@/server/services/product-service";
import { listPaymentLinks } from "@/server/services/payment-link-service";
import { listPayments } from "@/server/services/payment-service";
import { listWallets } from "@/server/services/wallet-service";
import { ApiError } from "@/server/http/errors";
import { parsePageParams } from "@/lib/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatProductPrice } from "@/features/products/format";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { PaymentLinksPanel } from "@/features/payment-links/components/payment-links-panel";
import { PaymentsTable } from "@/features/payments/components/payments-table";

export const metadata: Metadata = { title: "Product — StellarHooks" };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const network = await getModeNetwork();
  const { id } = await params;

  let product;
  try {
    product = await getProduct(user.id, id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [{ links }, { payments }, wallets] = await Promise.all([
    listPaymentLinks(user.id, parsePageParams({ pageSize: 100 }), { productId: id, network }),
    listPayments(user.id, parsePageParams({ pageSize: 10 }), { productId: id, network }),
    listWallets(user.id, network),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Products
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <Package className="size-6 text-muted-foreground" />
            )}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
              <StatusBadge
                tone={product.active ? "active" : "paused"}
                label={product.active ? "Active" : "Inactive"}
              />
            </div>
            {product.description && (
              <p className="text-sm text-muted-foreground">{product.description}</p>
            )}
          </div>
        </div>
        <ProductFormDialog
          wallets={wallets}
          product={product}
          trigger={
            <Button variant="outline">
              <Pencil className="size-4" />
              Edit
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 py-1">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-semibold">{formatProductPrice(product)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 py-1">
            <p className="text-sm text-muted-foreground">Asset</p>
            <p className="text-lg font-semibold">
              {product.assetCode} <Badge variant="secondary">{product.priceType}</Badge>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 py-1">
            <p className="text-sm text-muted-foreground">Wallet</p>
            <p className="truncate text-lg font-semibold">{product.wallet.name}</p>
          </CardContent>
        </Card>
      </div>

      <PaymentLinksPanel productId={product.id} links={links} />

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Recent payments</h2>
        {payments.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No payments yet for this product.
          </p>
        ) : (
          <PaymentsTable payments={payments} showProduct={false} />
        )}
      </div>
    </div>
  );
}
