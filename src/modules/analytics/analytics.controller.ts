import type { NextRequest } from "next/server";
import { analyticsService } from "@/modules/analytics/analytics.service";
import { analyticsRangeQuerySchema } from "@/modules/analytics/analytics.validators";
import { ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext } from "@/types/api";

export const analyticsController = {
  async forLot(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id: lotId } = await ctx.params;
    const url = new URL(req.url);
    const query = analyticsRangeQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const summary = await analyticsService.getForLot(ctx.user.id, ctx.user.role, lotId, query.from, query.to);
    return ok(summary);
  },

  async forOperator(req: NextRequest, ctx: AuthedRouteContext) {
    const url = new URL(req.url);
    const query = analyticsRangeQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const summary = await analyticsService.getForOperator(ctx.user.id, query.from, query.to);
    return ok(summary);
  },

  async platform(req: NextRequest) {
    const url = new URL(req.url);
    const query = analyticsRangeQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const summary = await analyticsService.getPlatform(query.from, query.to);
    return ok(summary);
  },
};
