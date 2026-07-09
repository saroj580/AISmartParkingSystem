import { parkingSpacesController } from "@/modules/parking-spaces/parking-spaces.controller";
import { withErrorHandling } from "@/middlewares/errorHandler";

export const GET = withErrorHandling(parkingSpacesController.availability);
