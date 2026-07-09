import { analyticsService } from "@/modules/analytics/analytics.service";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("job:analytics-aggregation");

/** Rolls up yesterday's metrics for every active lot into AnalyticsDaily. */
export async function analyticsAggregationJob() {
  const processed = await analyticsService.aggregateDailyForAllLots();
  log.info({ processed }, "Aggregated daily analytics for lots");
  return processed;
}
