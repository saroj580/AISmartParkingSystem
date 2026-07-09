import cron from "node-cron";
import { releaseExpiredBookingsJob } from "@/jobs/releaseExpiredBookings.job";
import { bookingRemindersJob } from "@/jobs/bookingReminders.job";
import { analyticsAggregationJob } from "@/jobs/analyticsAggregation.job";
import { cleanupJob } from "@/jobs/cleanup.job";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("worker");

function runSafely(name: string, fn: () => Promise<unknown>) {
  return async () => {
    try {
      await fn();
    } catch (err) {
      log.error({ err, job: name }, "Background job failed");
    }
  };
}

// Every minute: release PENDING bookings whose unpaid hold window has lapsed.
cron.schedule("* * * * *", runSafely("releaseExpiredBookings", releaseExpiredBookingsJob));

// Every 5 minutes: notify drivers whose confirmed booking starts soon.
cron.schedule("*/5 * * * *", runSafely("bookingReminders", bookingRemindersJob));

// Daily at 00:15: roll up yesterday's per-lot analytics.
cron.schedule("15 0 * * *", runSafely("analyticsAggregation", analyticsAggregationJob));

// Daily at 03:00: housekeeping sweep (stale sessions, lapsed QR codes).
cron.schedule("0 3 * * *", runSafely("cleanup", cleanupJob));

log.info("Background job worker started");
