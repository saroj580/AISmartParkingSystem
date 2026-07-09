/** Cross-module tunables that aren't secrets — kept in one place to avoid magic numbers scattered across services. */

export const BOOKING_HOLD_MINUTES = 15; // time a PENDING (unpaid) booking holds the space before auto-release
export const BOOKING_REMINDER_MINUTES_BEFORE = 30; // send a reminder this many minutes before startTime
export const QR_CODE_VALIDITY_BUFFER_MINUTES = 30; // QR remains valid this long past booking endTime for late checkout

export const CACHE_TTL_SECONDS = {
  nearbyLots: 60,
  lotAvailability: 15,
  dashboardMetrics: 30,
  analyticsSummary: 300,
} as const;

export const RATE_LIMIT_BUCKETS = {
  login: "auth:login",
  register: "auth:register",
  refresh: "auth:refresh",
  bookingCreate: "booking:create",
  qrValidate: "qr:validate",
  webhook: "payments:webhook",
  default: "api:default",
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;
