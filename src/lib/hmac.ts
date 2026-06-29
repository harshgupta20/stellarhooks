import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** SHA-256 hex digest — used to store API keys without keeping the raw value. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Compute an HMAC-SHA256 signature of `payload` using `secret`, returned as a
 * lowercase hex string prefixed with "sha256=" (GitHub-style).
 */
export function signPayload(secret: string, payload: string): string {
  const digest = createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  return `sha256=${digest}`;
}

/** Constant-time comparison of two signatures. */
export function verifySignature(secret: string, payload: string, signature: string): boolean {
  const expected = signPayload(secret, payload);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Generate a random webhook signing secret (hex). */
export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

/** Generate an API key and its display prefix. */
export function generateApiKey(): { key: string; prefix: string } {
  const raw = randomBytes(24).toString("hex");
  const key = `sk_${raw}`;
  return { key, prefix: key.slice(0, 11) };
}
