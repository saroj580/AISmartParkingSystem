import { authController } from "@/modules/auth/auth.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";

export const POST = withErrorHandling(authController.logout);
