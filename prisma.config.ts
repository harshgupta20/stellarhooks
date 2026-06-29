import { defineConfig } from "prisma/config";

// Prisma 7 no longer auto-loads .env for the config file; load it ourselves.
try {
  process.loadEnvFile();
} catch {
  // No .env file (e.g. CI with real env vars) — ignore.
}

/**
 * Prisma 7 configuration. Connection URLs live here (not in schema.prisma).
 * Migrations/introspection use DIRECT_URL when present (Neon's non-pooled host),
 * otherwise DATABASE_URL.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
