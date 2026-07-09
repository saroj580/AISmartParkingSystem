import { notificationsController } from "@/modules/notifications/notifications.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";

export const GET = withErrorHandling(withAuth(notificationsController.list));
