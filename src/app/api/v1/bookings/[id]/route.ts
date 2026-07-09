import { bookingsController } from "@/modules/bookings/bookings.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";
import { withAuth } from "@/middlewares/auth.middleware";

export const GET = withErrorHandling(withAuth(bookingsController.getById));
