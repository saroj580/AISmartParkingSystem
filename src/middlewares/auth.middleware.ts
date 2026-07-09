import type { NextRequest } from "next/server";
import { extractBearerToken, verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError } from "@/errors/AppError";
import type { AuthedRouteContext, AuthedRouteHandler, RouteContext, RouteHandler, RouteParams } from "@/types/api";

const ACCESS_TOKEN_COOKIE = "spms_access_token";

function getAccessToken(req: NextRequest): string {
  const cookieToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (cookieToken) return cookieToken;
  return extractBearerToken(req.headers.get("authorization"));
}

/** Verifies the JWT access token (cookie or Bearer header) and injects `ctx.user` into the handler. */
export function withAuth<P extends RouteParams = RouteParams>(
  handler: AuthedRouteHandler<P>
): RouteHandler<P> {
  return async (req: NextRequest, ctx: RouteContext<P>) => {
    const token = getAccessToken(req);
    const payload = verifyAccessToken(token);

    if (!payload.sub) {
      throw new UnauthorizedError("Invalid access token payload");
    }

    const authedCtx: AuthedRouteContext<P> = {
      ...ctx,
      user: { id: payload.sub, role: payload.role, email: payload.email },
    };

    return handler(req, authedCtx);
  };
}

export { ACCESS_TOKEN_COOKIE };
