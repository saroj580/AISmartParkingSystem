import type { NextResponse } from "next/server";
import { isProduction } from "@/lib/env";

export const ACCESS_TOKEN_COOKIE = "spms_access_token";
export const REFRESH_TOKEN_COOKIE = "spms_refresh_token";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
  maxAgeSeconds: { access: number; refresh: number }
): NextResponse {
  res.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: maxAgeSeconds.access,
  });
  res.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: maxAgeSeconds.refresh,
  });
  return res;
}

export function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.delete(ACCESS_TOKEN_COOKIE);
  res.cookies.delete(REFRESH_TOKEN_COOKIE);
  return res;
}
