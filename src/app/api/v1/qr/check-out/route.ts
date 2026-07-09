import { Role } from "@prisma/client";
import { qrController } from "@/modules/qr/qr.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";
import { withRateLimit } from "@/middlewares/rateLimit.middleware";
import { RATE_LIMIT_BUCKETS } from "@/constants/config";

export const POST = withErrorHandling(
  withRateLimit(
    { bucket: RATE_LIMIT_BUCKETS.qrValidate, windowSeconds: 60, maxRequests: 60 },
    withAuth(withRole([Role.OPERATOR, Role.ADMIN], qrController.checkOut))
  )
);
