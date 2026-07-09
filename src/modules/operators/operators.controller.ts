import type { NextRequest } from "next/server";
import { operatorsService } from "@/modules/operators/operators.service";
import { updateOperatorProfileSchema, verifyOperatorSchema } from "@/modules/operators/operators.validators";
import { validateBody } from "@/helpers/validation";
import { ok } from "@/helpers/apiResponse";
import { buildPaginationMeta, parsePaginationFromUrl, resolvePagination } from "@/helpers/pagination";
import type { AuthedRouteContext } from "@/types/api";

export const operatorsController = {
  async me(_req: NextRequest, ctx: AuthedRouteContext) {
    const profile = await operatorsService.getMyProfile(ctx.user.id);
    return ok(profile);
  },

  async updateMe(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, updateOperatorProfileSchema);
    const profile = await operatorsService.updateMyProfile(ctx.user.id, body);
    return ok(profile);
  },

  async list(req: NextRequest) {
    const url = new URL(req.url);
    const pagination = resolvePagination(parsePaginationFromUrl(url));
    const { items, total } = await operatorsService.list(pagination);
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async getById(_req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const profile = await operatorsService.getById(id);
    return ok(profile);
  },

  async verify(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const body = await validateBody(req, verifyOperatorSchema);
    const profile = await operatorsService.setVerified(id, body.isVerified);
    return ok(profile);
  },
};
