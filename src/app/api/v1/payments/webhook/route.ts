import { paymentsController } from "@/modules/payments/payments.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";

// Stripe requires the raw request body for signature verification, so this route
// intentionally bypasses JSON body parsing and JWT auth (authenticity comes from
// the `stripe-signature` header instead).
export const POST = withErrorHandling(paymentsController.webhook);
