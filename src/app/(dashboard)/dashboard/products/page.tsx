import { type Metadata } from "next";
import Link from "next/link";
import { Package, Plus } from "lucide-react";

import { requireUser } from "@/server/auth/guards";
import { getModeNetwork } from "@/server/mode";
import { listProducts } from "@/server/services/product-service";
import { listWallets } from "@/server/services/wallet-service";
import { parsePageParams } from "@/lib/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { ProductsTable } from "@/features/products/components/products-table";

export const metadata: Metadata = { title: "Products — StellarHooks" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();
  const network = await getModeNetwork();
  const { page } = await searchParams;
  const params = parsePageParams({ page });
  const [{ products, meta }, wallets] = await Promise.all([
    listProducts(user.id, params, { network }),
    listWallets(user.id, network),
  ]);

  const createButton = (
    <ProductFormDialog
      wallets={wallets}
      trigger={
        <Button disabled={wallets.length === 0}>
          <Plus className="size-4" />
          New product
        </Button>
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Things customers can pay for. Each can generate payment links."
        action={wallets.length > 0 ? createButton : undefined}
      />

      {wallets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Add a wallet first"
          description="Products receive payments into a monitored wallet. Add one to get started."
          action={
            <Button asChild>
              <Link href="/dashboard/wallets">Add a monitored wallet</Link>
            </Button>
          }
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Create a product to start accepting Stellar payments via payment links."
          action={createButton}
        />
      ) : (
        <>
          <ProductsTable products={products} wallets={wallets} />
          <Pagination
            meta={meta}
            prevHref={`/dashboard/products?page=${meta.page - 1}`}
            nextHref={`/dashboard/products?page=${meta.page + 1}`}
          />
        </>
      )}
    </div>
  );
}
