import type { NextRequest } from "next/server";
import { notificationsRepository } from "@/modules/notifications/notifications.repository";
import { buildPaginationMeta, parsePaginationFromUrl, resolvePagination } from "@/helpers/pagination";
import { ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext } from "@/types/api";

export const notificationsController = {
  async list(req: NextRequest, ctx: AuthedRouteContext) {
    const url = new URL(req.url);
    const query = parsePaginationFromUrl(url);
    const pagination = resolvePagination(query);

    const { items, total } = await notificationsRepository.listForUser(ctx.user.id, pagination);
    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },
};
