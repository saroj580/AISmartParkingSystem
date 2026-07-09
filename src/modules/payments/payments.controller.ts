import type { NextRequest } from "next/server";
import { paymentsService } from "@/modules/payments/payments.service";
import { createPaymentIntentSchema, refundPaymentSchema } from "@/modules/payments/payments.validators";
import { validateBody } from "@/helpers/validation";
import { buildPaginationMeta, parsePaginationFromUrl, resolvePagination } from "@/helpers/pagination";
import { created, ok } from "@/helpers/apiResponse";
import { BadRequestError } from "@/errors/AppError";
import { createModuleLogger } from "@/lib/logger";
import type { AuthedRouteContext } from "@/types/api";

const log = createModuleLogger("payments-controller");

export const paymentsController = {
  async createIntent(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, createPaymentIntentSchema);
    const result = await paymentsService.createIntent(ctx.user.id, body.bookingId);
    return created(result);
  },

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

  async webhook(req: NextRequest) {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new BadRequestError("Missing stripe-signature header");
    }

    const rawBody = await req.text();

    let event;
    try {
      event = paymentsService.verifyWebhookSignature(rawBody, signature);
    } catch (err) {
      log.warn({ err }, "Stripe webhook signature verification failed");
      throw new BadRequestError("Invalid webhook signature");
    }

    await paymentsService.handleWebhookEvent(event);
    return ok({ received: true });
  },
};
