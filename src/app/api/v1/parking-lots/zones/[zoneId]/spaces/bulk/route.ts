import { Role } from "@prisma/client";
import { parkingSpacesController } from "@/modules/parking-spaces/parking-spaces.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const POST = withErrorHandling(withAuth(withRole([Role.OPERATOR], parkingSpacesController.bulkCreate)));
