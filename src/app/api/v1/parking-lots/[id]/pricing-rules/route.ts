import { Role } from "@prisma/client";
import { pricingController } from "@/modules/pricing/pricing.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const GET = withErrorHandling(pricingController.listByLot);
export const POST = withErrorHandling(withAuth(withRole([Role.OPERATOR], pricingController.create)));
