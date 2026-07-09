import { bookingsService } from "@/modules/bookings/bookings.service";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("job:release-expired-bookings");

export async function releaseExpiredBookingsJob() {
  const count = await bookingsService.releaseExpiredHolds();
  if (count > 0) {
    log.info({ count }, "Released expired booking holds");
  }
  return count;
}
