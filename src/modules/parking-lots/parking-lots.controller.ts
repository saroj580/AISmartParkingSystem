import type { NextRequest } from "next/server";
import { parkingLotsService } from "@/modules/parking-lots/parking-lots.service";
import { createLotSchema, nearbySearchQuerySchema, updateLotSchema } from "@/modules/parking-lots/parking-lots.validators";
import { validateBody } from "@/helpers/validation";
import { buildPaginationMeta, parsePaginationFromUrl, resolvePagination } from "@/helpers/pagination";
import { created, ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext, RouteContext } from "@/types/api";

export const parkingLotsController = {
  async create(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, createLotSchema);
    const lot = await parkingLotsService.create(ctx.user.id, body);
    return created(lot);
  },

  async listMine(req: NextRequest, ctx: AuthedRouteContext) {
    const url = new URL(req.url);
    const pagination = resolvePagination(parsePaginationFromUrl(url));
    const { items, total } = await parkingLotsService.listMine(ctx.user.id, pagination);
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async listPublic(req: NextRequest) {
    const url = new URL(req.url);
    const query = parsePaginationFromUrl(url);
    const pagination = resolvePagination(query);
    const city = url.searchParams.get("city") ?? undefined;

    const { items, total } = await parkingLotsService.listPublic(pagination, { city, search: query.search });
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async nearby(req: NextRequest) {
    const url = new URL(req.url);
    const query = nearbySearchQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));

    const { items, total } = await parkingLotsService.searchNearby(query);
    return ok(items, buildPaginationMeta(total, query.page, query.limit));
  },

  async getById(_req: NextRequest, ctx: RouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const lot = await parkingLotsService.getById(id);
    return ok(lot);
  },

  async update(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const body = await validateBody(req, updateLotSchema);
    const lot = await parkingLotsService.update(ctx.user.id, id, body);
    return ok(lot);
  },
};
