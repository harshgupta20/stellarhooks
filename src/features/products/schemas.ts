import { z } from "zod";

import { PRICE_TYPES } from "@/lib/constants";
import { isValidStellarPublicKey, isNativeAsset } from "@/lib/stellar";

const decimalString = z
  .string()
  .trim()
  .refine((v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0;
  }, "Enter a valid amount")
  .refine((v) => (v.split(".")[1]?.length ?? 0) <= 7, "At most 7 decimal places");

const baseProduct = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  imageUrl: z.string().trim().url("Enter a valid image URL").optional().or(z.literal("")),
  walletId: z.string().min(1, "Select a wallet"),
  assetCode: z.string().trim().min(1, "Asset code is required").max(12),
  assetIssuer: z.string().trim().optional().or(z.literal("")),
  priceType: z.enum(PRICE_TYPES),
  price: decimalString.optional().or(z.literal("")),
  minAmount: decimalString.optional().or(z.literal("")),
  active: z.boolean().optional(),
});

function refineProduct(data: z.infer<typeof baseProduct>, ctx: z.RefinementCtx) {
  if (!isNativeAsset(data.assetCode)) {
    if (!data.assetIssuer || !isValidStellarPublicKey(data.assetIssuer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["assetIssuer"],
        message: "A valid issuer (G…) is required for non-XLM assets",
      });
    }
  }
  if (data.priceType === "FIXED") {
    if (!data.price || Number(data.price) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "A price greater than 0 is required for fixed-price products",
      });
    }
  }
}

export const createProductSchema = baseProduct.superRefine(refineProduct);
export const updateProductSchema = baseProduct.partial().superRefine((data, ctx) => {
  // Only validate cross-fields when the relevant fields are present.
  if (data.assetCode && data.priceType) refineProduct(data as z.infer<typeof baseProduct>, ctx);
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
