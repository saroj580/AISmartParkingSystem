import { Role } from "@prisma/client";
import { paymentsController } from "@/modules/payments/payments.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(withAuth(withRole([Role.DRIVER], paymentsController.listMine)));
