import { Role } from "@prisma/client";
import { zonesController } from "@/modules/parking-lots/zones.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(zonesController.listByLot);
export const POST = withErrorHandling(withAuth(withRole([Role.OPERATOR], zonesController.create)));
