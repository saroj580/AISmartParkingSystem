import { Role } from "@prisma/client";
import { operatorsController } from "@/modules/operators/operators.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const PATCH = withErrorHandling(withAuth(withRole([Role.ADMIN], operatorsController.verify)));
