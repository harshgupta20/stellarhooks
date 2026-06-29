import { z } from "zod";

import { NETWORKS } from "@/lib/constants";
import { isValidStellarPublicKey } from "@/lib/stellar";

export const createWalletSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  address: z
    .string()
    .trim()
    .refine(isValidStellarPublicKey, "Enter a valid Stellar public key (starts with G)"),
  network: z.enum(NETWORKS),
});

export const updateWalletSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(60),
    status: z.enum(["ACTIVE", "PAUSED"]),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
