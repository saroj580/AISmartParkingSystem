import { Role } from "@prisma/client";
import { usersController } from "@/modules/users/users.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(withAuth(withRole([Role.ADMIN], usersController.list)));
