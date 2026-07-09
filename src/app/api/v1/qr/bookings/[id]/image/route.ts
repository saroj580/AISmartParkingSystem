import { Role } from "@prisma/client";
import { qrController } from "@/modules/qr/qr.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(withAuth(withRole([Role.DRIVER], qrController.getImage)));
