import { parkingLotsController } from "@/modules/parking-lots/parking-lots.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withRateLimit } from "@/middlewares/rateLimit.middleware";
import { RATE_LIMIT_BUCKETS } from "@/constants/config";

export const GET = withErrorHandling(
  withRateLimit({ bucket: RATE_LIMIT_BUCKETS.default, maxRequests: 200 }, parkingLotsController.nearby)
);
