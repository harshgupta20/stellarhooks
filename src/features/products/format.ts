import { formatAmount } from "@/lib/format";
import { type ProductDTO } from "@/features/products/types";

/** Human-readable price label, e.g. "25 XLM" or "Custom · min 1 USDC". */
export function formatProductPrice(
  product: Pick<ProductDTO, "priceType" | "price" | "minAmount" | "assetCode">,
): string {
  if (product.priceType === "FIXED" && product.price) {
    return `${formatAmount(product.price)} ${product.assetCode}`;
  }
  if (product.minAmount) {
    return `Custom · min ${formatAmount(product.minAmount)} ${product.assetCode}`;
  }
  return `Custom · ${product.assetCode}`;
}
