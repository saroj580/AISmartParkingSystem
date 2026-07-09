import { Role } from "@prisma/client";
import { parkingLotsController } from "@/modules/parking-lots/parking-lots.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(parkingLotsController.listPublic);
export const POST = withErrorHandling(withAuth(withRole([Role.OPERATOR], parkingLotsController.create)));
