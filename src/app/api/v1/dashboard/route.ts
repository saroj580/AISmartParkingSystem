import { dashboardController } from "@/modules/dashboard/dashboard.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";

export const GET = withErrorHandling(withAuth(dashboardController.get));
