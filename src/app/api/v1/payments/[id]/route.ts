import { paymentsController } from "@/modules/payments/payments.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";

export const GET = withErrorHandling(withAuth(paymentsController.getById));
