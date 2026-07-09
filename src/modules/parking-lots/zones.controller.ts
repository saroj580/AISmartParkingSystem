import type { NextRequest } from "next/server";
import { zonesService } from "@/modules/parking-lots/zones.service";
import { createZoneSchema, updateZoneSchema } from "@/modules/parking-lots/zones.validators";
import { validateBody } from "@/helpers/validation";
import { created, ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext, RouteContext } from "@/types/api";

export const zonesController = {
  async create(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id: lotId } = await ctx.params;
    const body = await validateBody(req, createZoneSchema);
    const zone = await zonesService.create(ctx.user.id, lotId, body);
    return created(zone);
  },

  async listByLot(_req: NextRequest, ctx: RouteContext<{ id: string }>) {
    const { id: lotId } = await ctx.params;
    const zones = await zonesService.listByLot(lotId);
    return ok(zones);
  },

  async update(req: NextRequest, ctx: AuthedRouteContext<{ zoneId: string }>) {
    const { zoneId } = await ctx.params;
    const body = await validateBody(req, updateZoneSchema);
    const zone = await zonesService.update(ctx.user.id, zoneId, body);
    return ok(zone);
  },
};
