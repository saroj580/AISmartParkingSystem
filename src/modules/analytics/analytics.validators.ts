import { z } from "zod";

export const analyticsRangeQuerySchema = z.object({
  from: z.coerce.date().default(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  to: z.coerce.date().default(() => new Date()),
  lotId: z.string().optional(),
});

export type AnalyticsRangeQuery = z.infer<typeof analyticsRangeQuerySchema>;
