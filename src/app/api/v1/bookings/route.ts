import { Role } from "@prisma/client";
import { bookingsController } from "@/modules/bookings/bookings.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";
import { withRateLimit } from "@/middlewares/rateLimit.middleware";
import { RATE_LIMIT_BUCKETS } from "@/constants/config";

export const POST = withErrorHandling(
  withRateLimit(
    { bucket: RATE_LIMIT_BUCKETS.bookingCreate, windowSeconds: 60, maxRequests: 20 },
    withAuth(withRole([Role.DRIVER], bookingsController.create))
  )
);

export const GET = withErrorHandling(withAuth(withRole([Role.DRIVER], bookingsController.listMine)));
