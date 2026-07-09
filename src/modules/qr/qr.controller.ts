import type { NextRequest } from "next/server";
import { qrService } from "@/modules/qr/qr.service";
import { scanQrSchema } from "@/modules/qr/qr.validators";
import { validateBody } from "@/helpers/validation";
import { ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext } from "@/types/api";

export const qrController = {
  async getImage(_req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id: bookingId } = await ctx.params;
    const qr = await qrService.getImageForBooking(ctx.user.id, bookingId);
    return ok(qr);
  },

  async checkIn(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, scanQrSchema);
    const booking = await qrService.checkIn(ctx.user.id, ctx.user.role, body.code);
    return ok(booking);
  },

  async checkOut(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, scanQrSchema);
    const booking = await qrService.checkOut(ctx.user.id, ctx.user.role, body.code);
    return ok(booking);
  },
};
