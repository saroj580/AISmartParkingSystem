import { Role } from "@prisma/client";
import { pricingController } from "@/modules/pricing/pricing.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";
import { withRole } from "@/middlewares/rbac.middleware";

export const PATCH = withErrorHandling(withAuth(withRole([Role.OPERATOR], pricingController.update)));
