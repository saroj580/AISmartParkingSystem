import QRCode from "qrcode";
import { randomBytes } from "crypto";
import { env } from "@/lib/env";
import { hmacSha256, safeEqual } from "@/lib/hash";
import { BadRequestError } from "@/errors/AppError";

interface QrTokenPayload {
  bookingId: string;
  nonce: string;
}

/** Generates an opaque, HMAC-signed token string that becomes QrCode.code — unguessable and tamper-evident. */
export function generateSignedQrToken(bookingId: string): string {
  const nonce = randomBytes(16).toString("hex");
  const payload: QrTokenPayload = { bookingId, nonce };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = hmacSha256(encoded, env.QR_CODE_SECRET);
  return `${encoded}.${signature}`;
}

export function verifySignedQrToken(token: string): QrTokenPayload {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    throw new BadRequestError("Malformed QR code");
  }

  const expectedSignature = hmacSha256(encoded, env.QR_CODE_SECRET);
  if (!safeEqual(signature, expectedSignature)) {
    throw new BadRequestError("QR code signature verification failed");
  }

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as QrTokenPayload;
  } catch {
    throw new BadRequestError("Malformed QR code payload");
  }
}

/** Renders the signed token as a scannable PNG data URI for the driver's booking confirmation/app. */
export async function renderQrCodeImage(token: string): Promise<string> {
  return QRCode.toDataURL(token, { errorCorrectionLevel: "M", margin: 2, width: 320 });
}
