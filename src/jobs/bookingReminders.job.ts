import { bookingsService } from "@/modules/bookings/bookings.service";
import { BOOKING_REMINDER_MINUTES_BEFORE } from "@/constants/config";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("job:booking-reminders");

export async function bookingRemindersJob() {
  const now = new Date();
  const windowStart = now;
  const windowEnd = new Date(now.getTime() + BOOKING_REMINDER_MINUTES_BEFORE * 60_000);

  const count = await bookingsService.sendUpcomingReminders(windowStart, windowEnd);
  if (count > 0) {
    log.info({ count }, "Sent upcoming booking reminders");
  }
  return count;
}
