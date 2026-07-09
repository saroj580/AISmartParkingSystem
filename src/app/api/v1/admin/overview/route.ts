import { Role } from "@prisma/client";
import { adminController } from "@/modules/admin/admin.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(withAuth(withRole([Role.ADMIN], adminController.overview)));
