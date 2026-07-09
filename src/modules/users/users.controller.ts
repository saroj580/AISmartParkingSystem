import type { NextRequest } from "next/server";
import { usersService } from "@/modules/users/users.service";
import { updateProfileSchema, uploadAvatarSchema, userStatusSchema } from "@/modules/users/users.validators";
import { validateBody } from "@/helpers/validation";
import { buildPaginationMeta, parsePaginationFromUrl, resolvePagination } from "@/helpers/pagination";
import { ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext } from "@/types/api";
import type { Role } from "@prisma/client";

export const usersController = {
  async me(_req: NextRequest, ctx: AuthedRouteContext) {
    const user = await usersService.getProfile(ctx.user.id);
    return ok(user);
  },

  async updateMe(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, updateProfileSchema);
    const user = await usersService.updateProfile(ctx.user.id, body);
    return ok(user);
  },

  async uploadAvatar(req: NextRequest, ctx: AuthedRouteContext) {
    const body = await validateBody(req, uploadAvatarSchema);
    const user = await usersService.uploadAvatar(ctx.user.id, body.imageBase64);
    return ok(user);
  },

  async list(req: NextRequest) {
    const url = new URL(req.url);
    const query = parsePaginationFromUrl(url);
    const pagination = resolvePagination(query);
    const role = url.searchParams.get("role") as Role | null;

    const { items, total } = await usersService.adminListUsers(pagination, {
      role: role ?? undefined,
      search: query.search,
    });

    return ok(items, buildPaginationMeta(total, pagination.page, pagination.limit));
  },

  async getById(_req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const user = await usersService.adminGetUser(id);
    return ok(user);
  },

  async setStatus(req: NextRequest, ctx: AuthedRouteContext<{ id: string }>) {
    const { id } = await ctx.params;
    const body = await validateBody(req, userStatusSchema);
    const user = await usersService.adminSetActive(id, body.isActive);
    return ok(user);
  },
};
