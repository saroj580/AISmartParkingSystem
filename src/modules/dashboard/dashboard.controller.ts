import type { NextRequest } from "next/server";
import { dashboardService } from "@/modules/dashboard/dashboard.service";
import { ok } from "@/helpers/apiResponse";
import { ForbiddenError } from "@/errors/AppError";
import type { AuthedRouteContext } from "@/types/api";

export const dashboardController = {
  async get(_req: NextRequest, ctx: AuthedRouteContext) {
    switch (ctx.user.role) {
      case "DRIVER":
        return ok(await dashboardService.getDriverDashboard(ctx.user.id));
      case "OPERATOR":
        return ok(await dashboardService.getOperatorDashboard(ctx.user.id));
      case "ADMIN":
        return ok(await dashboardService.getAdminDashboard());
      default:
        throw new ForbiddenError("Unknown role");
    }
  },
};
