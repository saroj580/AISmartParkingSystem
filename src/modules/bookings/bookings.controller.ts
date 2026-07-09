import type { NextRequest } from "next/server";
import { bookingsService } from "@/modules/bookings/bookings.service";
import { cancelBookingSchema, createBookingSchema, listBookingsQuerySchema } from "@/modules/bookings/bookings.validators";
import { validateBody } from "@/helpers/validation";
import { buildPaginationMeta, resolvePagination } from "@/helpers/pagination";
import { created, ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext } from "@/types/api";

export const bookingsController = {
  async create(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, createBookingSchema);
    const booking = await bookingsService.create(ctx.user.id, body);
    return created(booking);
  },

  async listMine(req: NextRequest, ctx: AuthedRouteContext) {
    const url = new URL(req.url);
    const query = listBookingsQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const pagination = resolvePagination(query);

    const { items, total } = await bookingsService.listMine(ctx.user.id, { status: query.status }, pagination);
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async listForMyLots(req: NextRequest, ctx: AuthedRouteContext) {
    const url = new URL(req.url);
    const query = listBookingsQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
    const pagination = resolvePagination(query);

    const { items, total } = await bookingsService.listForMyLots(ctx.user.id, { status: query.status }, pagination);
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async getById(_req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const booking = await bookingsService.getById(ctx.user.id, ctx.user.role, id);
    return ok(booking);
  },

  async cancel(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const body = await validateBody(req, cancelBookingSchema);
    const booking = await bookingsService.cancel(ctx.user.id, id, body.reason);
    return ok(booking);
  },
};
