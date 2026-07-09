import { usersController } from "@/modules/users/users.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";

export const POST = withErrorHandling(withAuth(usersController.uploadAvatar));
