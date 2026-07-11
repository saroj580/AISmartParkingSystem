import type { NextRequest } from "next/server";
import { paymentsService } from "@/modules/payments/payments.service";
import { refundPaymentSchema } from "@/modules/payments/payments.validators";
import { validateBody } from "@/helpers/validation";
import { buildPaginationMeta, parsePaginationFromUrl, resolvePagination } from "@/helpers/pagination";
import { ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext } from "@/types/api";

export const paymentsController = {
  async refund(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const body = await validateBody(req, refundPaymentSchema);
    const refund = await paymentsService.refund(ctx.user.id, ctx.user.role, id, body);
    return ok(refund);
  },

  async listMine(req: NextRequest, ctx: AuthedRouteContext) {
    const url = new URL(req.url);
    const pagination = resolvePagination(parsePaginationFromUrl(url));
    const { items, total } = await paymentsService.listMine(ctx.user.id, pagination);
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async getById(_req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const payment = await paymentsService.getById(ctx.user.id, ctx.user.role, id);
    return ok(payment);
  },
};
