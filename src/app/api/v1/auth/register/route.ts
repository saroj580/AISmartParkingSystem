import { authController } from "@/modules/auth/auth.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withRateLimit } from "@/middlewares/rateLimit.middleware";
import { RATE_LIMIT_BUCKETS } from "@/constants/config";

export const POST = withErrorHandling(
  withRateLimit({ bucket: RATE_LIMIT_BUCKETS.register, windowSeconds: 3600, maxRequests: 10 }, authController.register)
);
