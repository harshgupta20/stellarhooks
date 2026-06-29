import { z } from "zod";

import { EVENT_TYPES } from "@/lib/constants";

const urlField = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .refine((u) => /^https?:\/\//.test(u), "URL must start with http:// or https://");

const eventsField = z
  .array(z.enum(EVENT_TYPES))
  .min(1, "Select at least one event")
  .refine((arr) => new Set(arr).size === arr.length, "Duplicate events");

export const createWebhookSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  url: urlField,
  events: eventsField,
});

export const updateWebhookSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(60),
    url: urlField,
    events: eventsField,
    status: z.enum(["ACTIVE", "PAUSED"]),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Provide at least one field to update");

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
