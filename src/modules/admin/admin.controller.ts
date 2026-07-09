import type { NextRequest } from "next/server";
import { adminService } from "@/modules/admin/admin.service";
import { ok } from "@/helpers/apiResponse";
import type { AuthedRouteContext } from "@/types/api";

export const adminController = {
  async overview(_req: NextRequest, _ctx: AuthedRouteContext) {
    const data = await adminService.getPlatformOverview();
    return ok(data);
  },
};
