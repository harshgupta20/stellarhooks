/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Package } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatProductPrice } from "@/features/products/format";
import { ProductRowActions } from "@/features/products/components/product-row-actions";
import { type ProductDTO } from "@/features/products/types";
import { type WalletDTO } from "@/features/wallets/types";

export function ProductsTable({
  products,
  wallets,
}: {
  products: ProductDTO[];
  wallets: WalletDTO[];
}) {
  return (
    <Card className="overflow-hidden py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Links</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="flex items-center gap-3 font-medium hover:underline"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Package className="size-4 text-muted-foreground" />
                    )}
                  </span>
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="text-sm">{formatProductPrice(product)}</TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{product.wallet.name}</span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{product.paymentLinkCount}</Badge>
              </TableCell>
              <TableCell>
                <StatusBadge
                  tone={product.active ? "active" : "paused"}
                  label={product.active ? "Active" : "Inactive"}
                />
              </TableCell>
              <TableCell>
                <ProductRowActions product={product} wallets={wallets} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
