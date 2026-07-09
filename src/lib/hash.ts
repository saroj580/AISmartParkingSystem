import { createHash, createHmac, timingSafeEqual } from "crypto";

/** Fast, deterministic SHA-256 hex digest — used for refresh-token-at-rest hashing (not bcrypt: high-entropy tokens don't need slow hashing). */
export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hmacSha256(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
