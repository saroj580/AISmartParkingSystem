import type { NextRequest } from "next/server";
import { vehiclesService } from "@/modules/vehicles/vehicles.service";
import { createVehicleSchema, updateVehicleSchema } from "@/modules/vehicles/vehicles.validators";
import { validateBody } from "@/helpers/validation";
import { buildPaginationMeta, parsePaginationFromUrl, resolvePagination } from "@/helpers/pagination";
import { created, noContent, ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext } from "@/types/api";

export const vehiclesController = {
  async create(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, createVehicleSchema);
    const vehicle = await vehiclesService.create(ctx.user.id, body);
    return created(vehicle);
  },

  async list(req: NextRequest, ctx: AuthedRouteContext) {
    const url = new URL(req.url);
    const pagination = resolvePagination(parsePaginationFromUrl(url));
    const { items, total } = await vehiclesService.listMine(ctx.user.id, pagination);
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async getById(_req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const vehicle = await vehiclesService.getMine(ctx.user.id, id);
    return ok(vehicle);
  },

  async update(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const body = await validateBody(req, updateVehicleSchema);
    const vehicle = await vehiclesService.update(ctx.user.id, id, body);
    return ok(vehicle);
  },

  async remove(_req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    await vehiclesService.remove(ctx.user.id, id);
    return noContent();
  },
};
