import { Role } from "@prisma/client";
import { driversController } from "@/modules/drivers/drivers.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(withAuth(withRole([Role.DRIVER], driversController.me)));
