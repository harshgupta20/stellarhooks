import { z } from "zod";

import { NETWORKS } from "@/lib/constants";
import { isValidStellarPublicKey } from "@/lib/stellar";

export const createCloudWalletSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  network: z.enum(NETWORKS),
});

const amountField = z
  .string()
  .trim()
  .refine((v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  }, "Enter an amount greater than 0")
  .refine((v) => {
    const decimals = v.split(".")[1]?.length ?? 0;
    return decimals <= 7;
  }, "Stellar supports at most 7 decimal places");

export const sendPaymentSchema = z.object({
  destination: z
    .string()
    .trim()
    .refine(isValidStellarPublicKey, "Enter a valid Stellar public key (starts with G)"),
  amount: amountField,
  memo: z.string().trim().max(28, "Memo can be at most 28 characters").optional(),
});

export type CreateCloudWalletInput = z.infer<typeof createCloudWalletSchema>;
export type SendPaymentInput = z.infer<typeof sendPaymentSchema>;
