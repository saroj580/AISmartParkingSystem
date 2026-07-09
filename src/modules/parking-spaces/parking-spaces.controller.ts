import type { NextRequest } from "next/server";
import { parkingSpacesService } from "@/modules/parking-spaces/parking-spaces.service";
import {
  bulkCreateSpacesSchema,
  createSpaceSchema,
  listSpacesQuerySchema,
  updateSpaceSchema,
} from "@/modules/parking-spaces/parking-spaces.validators";
import { validateBody } from "@/helpers/validation";
import { buildPaginationMeta, resolvePagination } from "@/helpers/pagination";
import { created, ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext, RouteContext } from "@/types/api";

export const parkingSpacesController = {
  async create(req: NextRequest, ctx: AuthedRouteContext<{ zoneId: string }>) {
    const { zoneId } = await ctx.params;
    const body = await validateBody(req, createSpaceSchema);
    const space = await parkingSpacesService.create(ctx.user.id, zoneId, body);
    return created(space);
  },

  async bulkCreate(req: NextRequest, ctx: AuthedRouteContext<{ zoneId: string }>) {
    const { zoneId } = await ctx.params;
    const body = await validateBody(req, bulkCreateSpacesSchema);
    const result = await parkingSpacesService.bulkCreate(ctx.user.id, zoneId, body);
    return created(result);
  },

  async listByLot(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id: lotId } = await ctx.params;
    const url = new URL(req.url);
    const query = listSpacesQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const pagination = resolvePagination(query);

    const { items, total } = await parkingSpacesService.listByLot(
      ctx.user.id,
      lotId,
      { vehicleType: query.vehicleType, status: query.status },
      pagination
    );

    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async updateStatus(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const body = await validateBody(req, updateSpaceSchema);
    const space = await parkingSpacesService.updateStatus(ctx.user.id, id, body);
    return ok(space);
  },

  async availability(_req: NextRequest, ctx: RouteContext<{ id: string }>) {
    const { id: lotId } = await ctx.params;
    const summary = await parkingSpacesService.getAvailabilitySummary(lotId);
    return ok(summary);
  },
};
