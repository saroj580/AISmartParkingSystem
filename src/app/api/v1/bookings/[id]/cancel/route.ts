import { Role } from "@prisma/client";
import { bookingsController } from "@/modules/bookings/bookings.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const POST = withErrorHandling(withAuth(withRole([Role.DRIVER], bookingsController.cancel)));
