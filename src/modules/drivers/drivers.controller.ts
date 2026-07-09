import type { NextRequest } from "next/server";
import { driversService } from "@/modules/drivers/drivers.service";
import { ok } from "@/helpers/apiResponse";
import { buildPaginationMeta, parsePaginationFromUrl, resolvePagination } from "@/helpers/pagination";
import type { AuthedRouteContext } from "@/types/api";

export const driversController = {
  async me(_req: NextRequest, ctx: AuthedRouteContext) {
    const profile = await driversService.getMyProfile(ctx.user.id);
    return ok(profile);
  },

  async list(req: NextRequest) {
    const url = new URL(req.url);
    const pagination = resolvePagination(parsePaginationFromUrl(url));
    const { items, total } = await driversService.list(pagination);
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },
};
