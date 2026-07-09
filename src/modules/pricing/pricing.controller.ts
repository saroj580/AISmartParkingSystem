import type { NextRequest } from "next/server";
import { pricingService } from "@/modules/pricing/pricing.service";
import { createPricingRuleSchema, updatePricingRuleSchema } from "@/modules/pricing/pricing.validators";
import { validateBody } from "@/helpers/validation";
import { created, ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext, RouteContext } from "@/types/api";

export const pricingController = {
  async create(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id: lotId } = await ctx.params;
    const body = await validateBody(req, createPricingRuleSchema);
    const rule = await pricingService.create(ctx.user.id, lotId, body);
    return created(rule);
  },

  async listByLot(_req: NextRequest, ctx: RouteContext<{ id: string }>) {
    const { id: lotId } = await ctx.params;
    const rules = await pricingService.listByLot(lotId);
    return ok(rules);
  },

  async update(req: NextRequest, ctx: AuthedRouteContext<{ ruleId: string }>) {
    const { ruleId } = await ctx.params;
    const body = await validateBody(req, updatePricingRuleSchema);
    const rule = await pricingService.update(ctx.user.id, ruleId, body);
    return ok(rule);
  },
};
