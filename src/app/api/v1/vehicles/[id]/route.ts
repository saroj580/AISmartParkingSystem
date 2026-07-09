import { Role } from "@prisma/client";
import { vehiclesController } from "@/modules/vehicles/vehicles.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(withAuth(withRole([Role.DRIVER], vehiclesController.getById)));
export const PATCH = withErrorHandling(withAuth(withRole([Role.DRIVER], vehiclesController.update)));
export const DELETE = withErrorHandling(withAuth(withRole([Role.DRIVER], vehiclesController.remove)));
