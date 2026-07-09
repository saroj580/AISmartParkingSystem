import { Role } from "@prisma/client";
import { vehiclesController } from "@/modules/vehicles/vehicles.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const POST = withErrorHandling(withAuth(withRole([Role.DRIVER], vehiclesController.create)));
export const GET = withErrorHandling(withAuth(withRole([Role.DRIVER], vehiclesController.list)));
