import type { NextRequest } from "next/server";
import { authService } from "@/modules/auth/auth.service";
import { loginSchema, refreshSchema, registerSchema } from "@/modules/auth/auth.validators";
import { validateBody } from "@/helpers/validation";
import { created, noContent, ok } from "@/helpers/apiResponse";
import { setAuthCookies, clearAuthCookies, REFRESH_TOKEN_COOKIE } from "@/helpers/cookies";
import type { AuthedRouteContext } from "@/types/api";
import { authRepository } from "@/modules/auth/auth.repository";
import { NotFoundError, UnauthorizedError } from "@/errors/AppError";

function requestMeta(req: NextRequest) {
  return {
    userAgent: req.headers.get("user-agent") ?? undefined,
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
  };
}

export const authController = {
  async register(req: NextRequest) {
    const body = await validateBody(req, registerSchema);
    const { user, tokens } = await authService.register(body, requestMeta(req));

    const res = created({ user, accessToken: tokens.accessToken });
    return setAuthCookies(res, tokens, {
      access: tokens.accessTokenExpiresInSeconds,
      refresh: tokens.refreshTokenExpiresInSeconds,
    });
  },

  async login(req: NextRequest) {
    const body = await validateBody(req, loginSchema);
    const { user, tokens } = await authService.login(body, requestMeta(req));

    const res = ok({ user, accessToken: tokens.accessToken });
    return setAuthCookies(res, tokens, {
      access: tokens.accessTokenExpiresInSeconds,
      refresh: tokens.refreshTokenExpiresInSeconds,
    });
  },

  async refresh(req: NextRequest) {
    const body = await validateBody(req, refreshSchema);
    const refreshToken = body.refreshToken ?? req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token provided");
    }

    const { user, tokens } = await authService.refresh(refreshToken, requestMeta(req));

    const res = ok({ user, accessToken: tokens.accessToken });
    return setAuthCookies(res, tokens, {
      access: tokens.accessTokenExpiresInSeconds,
      refresh: tokens.refreshTokenExpiresInSeconds,
    });
  },

  async logout(req: NextRequest) {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    await authService.logout(refreshToken);

    const res = noContent();
    return clearAuthCookies(res);
  },

  async me(_req: NextRequest, ctx: AuthedRouteContext) {
    const user = await authRepository.findUserById(ctx.user.id);
    if (!user) {
      throw new NotFoundError("User");
    }
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return ok(safeUser);
  },
};
