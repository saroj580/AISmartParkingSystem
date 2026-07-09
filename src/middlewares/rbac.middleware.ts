import type { Role } from "@prisma/client";
import type { NextRequest } from "next/server";
import { ForbiddenError } from "@/errors/AppError";
import type { AuthedRouteContext, AuthedRouteHandler, RouteParams } from "@/types/api";

/** Role-based access control — compose after `withAuth` to restrict a handler to specific roles. */
export function withRole<P extends RouteParams = RouteParams>(
  allowedRoles: Role[],
  handler: AuthedRouteHandler<P>
): AuthedRouteHandler<P> {
  return async (req: NextRequest, ctx: AuthedRouteContext<P>) => {
    if (!allowedRoles.includes(ctx.user.role)) {
      throw new ForbiddenError(`This action requires one of the following roles: ${allowedRoles.join(", ")}`);
    }
    return handler(req, ctx);
  };
}
