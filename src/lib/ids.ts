import { randomBytes } from "node:crypto";

// Unambiguous base32 alphabet (no 0/1/o/i/l).
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

/** Generate a short, URL- and memo-safe identifier (default 10 chars). */
export function generateSlug(length = 10): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}
