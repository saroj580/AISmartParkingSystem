import { authController } from "@/modules/auth/auth.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";

export const GET = withErrorHandling(withAuth(authController.me));
