import jwt, { type SignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";
import type { Role } from "@prisma/client";
import { env } from "@/lib/env";
import { UnauthorizedError } from "@/errors/AppError";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

export function signRefreshToken(userId: string, jti: string = randomUUID()): { token: string; jti: string } {
  const token = jwt.sign({ sub: userId, jti } satisfies RefreshTokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

export function extractBearerToken(authorizationHeader: string | null): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing bearer token");
  }
  return authorizationHeader.slice("Bearer ".length).trim();
}
