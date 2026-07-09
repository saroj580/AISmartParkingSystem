import { usersController } from "@/modules/users/users.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";

export const GET = withErrorHandling(withAuth(usersController.me));
export const PATCH = withErrorHandling(withAuth(usersController.updateMe));
