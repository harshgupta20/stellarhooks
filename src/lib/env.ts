import { z } from "zod";

/**
 * Server-side environment validation.
 * Import only from server code (services, route handlers, auth config).
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid Postgres connection string"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),
  WALLET_ENCRYPTION_KEY: z
    .string()
    .refine(
      (v) => {
        try {
          return Buffer.from(v, "base64").length === 32;
        } catch {
          return false;
        }
      },
      "WALLET_ENCRYPTION_KEY must be 32 bytes, base64-encoded (openssl rand -base64 32)",
    ),
  APP_URL: z.string().url().default("http://localhost:3000"),
  // Comma-separated emails always treated as platform admins (bootstrap).
  ADMIN_EMAILS: z.string().optional().default(""),
  HORIZON_TESTNET_URL: z.string().url().default("https://horizon-testnet.stellar.org"),
  HORIZON_PUBLIC_URL: z.string().url().default("https://horizon.stellar.org"),
  POLL_MAX_PAYMENTS_PER_WALLET: z.coerce.number().int().positive().default(50),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
