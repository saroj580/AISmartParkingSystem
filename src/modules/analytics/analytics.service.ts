import { Role, VehicleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { analyticsRepository, type DailyMetrics } from "@/modules/analytics/analytics.repository";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { ForbiddenError, NotFoundError } from "@/errors/AppError";
import { cacheGetOrSet, CacheKeys } from "@/lib/redis";
import { CACHE_TTL_SECONDS } from "@/constants/config";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("analytics-service");

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export const analyticsService = {
  /** Computes a single lot's metrics for one calendar day — shared by the nightly job and live "today" queries. */
  async computeDailyMetricsForLot(lotId: string, date: Date): Promise<DailyMetrics> {
    const from = startOfDay(date);
    const to = addDays(from, 1);

    const [totalBookings, completedBookings, cancelledBookings, totalRevenue, totalRefunds, completedForOccupancy, peakHour, newCustomers, activeSpaces] =
      await Promise.all([
        analyticsRepository.countBookingsInRange(lotId, from, to),
        analyticsRepository.countBookingsByStatusInRange(lotId, "COMPLETED", from, to),
        analyticsRepository.countBookingsByStatusInRange(lotId, "CANCELLED", from, to),
        analyticsRepository.sumRevenueInRange(lotId, from, to),
        analyticsRepository.sumRefundsInRange(lotId, from, to),
        analyticsRepository.completedBookingsForOccupancy(lotId, from, to),
        analyticsRepository.peakHour(lotId, from, to),
        analyticsRepository.newCustomersOnDate(lotId, from, to),
        analyticsRepository.countActiveSpaces(lotId),
      ]);

    const occupiedSpaceHours = completedForOccupancy.reduce(
      (sum, b) => sum + (b.endTime.getTime() - b.startTime.getTime()) / 3_600_000,
      0
    );

    const avgOccupancyRate = activeSpaces > 0 ? Math.min(100, (occupiedSpaceHours / (activeSpaces * 24)) * 100) : 0;

    const vehicleTypeBreakdown: Record<string, number> = {
      TWO_WHEELER: 0,
      THREE_WHEELER: 0,
      FOUR_WHEELER: 0,
    };
    for (const b of completedForOccupancy) {
      vehicleTypeBreakdown[b.vehicle.type] = (vehicleTypeBreakdown[b.vehicle.type] ?? 0) + 1;
    }

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      totalRefunds,
      occupiedSpaceHours: Math.round(occupiedSpaceHours * 100) / 100,
      avgOccupancyRate: Math.round(avgOccupancyRate * 100) / 100,
      peakHour,
      newCustomers,
      vehicleTypeBreakdown,
    };
  },

  /** Background job entry point: rolls up yesterday's (or a given date's) metrics for every active lot. */
  async aggregateDailyForAllLots(date: Date = addDays(new Date(), -1)) {
    const lots = await prisma.parkingLot.findMany({ where: { status: "ACTIVE" }, select: { id: true } });
    let processed = 0;

    for (const lot of lots) {
      try {
        const metrics = await this.computeDailyMetricsForLot(lot.id, date);
        await analyticsRepository.upsertDaily(lot.id, startOfDay(date), metrics);
        processed += 1;
      } catch (err) {
        log.error({ err, lotId: lot.id }, "Failed to aggregate daily analytics for lot");
      }
    }

    return processed;
  },

  async getForLot(userId: string, role: Role, lotId: string, from: Date, to: Date) {
    if (role !== "ADMIN") {
      const lot = await parkingLotsRepository.findById(lotId);
      if (!lot) throw new NotFoundError("Parking lot");

      const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
      if (!operatorId || lot.operatorId !== operatorId) {
        throw new ForbiddenError("You do not have access to this parking lot's analytics");
      }
    }

    const cacheKey = CacheKeys.analyticsSummary(lotId, `${from.toISOString()}:${to.toISOString()}`);

    return cacheGetOrSet(cacheKey, CACHE_TTL_SECONDS.analyticsSummary, async () => {
      const rows = await analyticsRepository.getRangeForLot(lotId, from, to);
      const normalized = rows.map(toSummaryRow);

      const today = startOfDay(new Date());
      const hasToday = normalized.some((r) => startOfDay(r.date).getTime() === today.getTime());
      const includesToday = from <= today && today <= to;

      if (includesToday && !hasToday) {
        const liveMetrics = await this.computeDailyMetricsForLot(lotId, today);
        normalized.push({ date: today, ...liveMetrics });
      }

      return summarize(normalized);
    });
  },

  async getForOperator(userId: string, from: Date, to: Date) {
    const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
    if (!operatorId) throw new ForbiddenError("Only operators can view analytics");

    const rows = await analyticsRepository.getRangeForOperator(operatorId, from, to);
    return summarize(rows.map(toSummaryRow));
  },

  async getPlatform(from: Date, to: Date) {
    const rows = await analyticsRepository.getRangeForAllLots(from, to);
    return summarize(rows.map(toSummaryRow));
  },
};

interface SummaryRow {
  date: Date;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalRefunds: number;
  occupiedSpaceHours: number;
  avgOccupancyRate: number;
  peakHour: number | null;
  newCustomers: number;
  vehicleTypeBreakdown: Record<string, number> | null;
}

function toSummaryRow(row: {
  date: Date;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: unknown;
  totalRefunds: unknown;
  occupiedSpaceHours: unknown;
  avgOccupancyRate: unknown;
  peakHour: number | null;
  newCustomers: number;
  vehicleTypeBreakdown: unknown;
}): SummaryRow {
  return {
    date: row.date,
    totalBookings: row.totalBookings,
    completedBookings: row.completedBookings,
    cancelledBookings: row.cancelledBookings,
    totalRevenue: Number(row.totalRevenue),
    totalRefunds: Number(row.totalRefunds),
    occupiedSpaceHours: Number(row.occupiedSpaceHours),
    avgOccupancyRate: Number(row.avgOccupancyRate),
    peakHour: row.peakHour,
    newCustomers: row.newCustomers,
    vehicleTypeBreakdown: (row.vehicleTypeBreakdown as Record<string, number> | null) ?? null,
  };
}

function summarize(rows: SummaryRow[]) {
  const trend = rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    totalBookings: r.totalBookings,
    completedBookings: r.completedBookings,
    cancelledBookings: r.cancelledBookings,
    revenue: Number(r.totalRevenue),
    refunds: Number(r.totalRefunds),
    occupancyRate: Number(r.avgOccupancyRate),
    peakHour: r.peakHour,
    newCustomers: r.newCustomers,
  }));

  const vehicleDistribution: Record<string, number> = {
    TWO_WHEELER: 0,
    THREE_WHEELER: 0,
    FOUR_WHEELER: 0,
  };

  for (const type of Object.values(VehicleType)) {
    vehicleDistribution[type] = rows.reduce((sum, r) => {
      const breakdown = (r.vehicleTypeBreakdown as Record<string, number> | null) ?? {};
      return sum + (breakdown[type] ?? 0);
    }, 0);
  }

  const totals = trend.reduce(
    (acc, r) => ({
      totalBookings: acc.totalBookings + r.totalBookings,
      completedBookings: acc.completedBookings + r.completedBookings,
      cancelledBookings: acc.cancelledBookings + r.cancelledBookings,
      revenue: acc.revenue + r.revenue,
      refunds: acc.refunds + r.refunds,
      newCustomers: acc.newCustomers + r.newCustomers,
    }),
    { totalBookings: 0, completedBookings: 0, cancelledBookings: 0, revenue: 0, refunds: 0, newCustomers: 0 }
  );

  const avgOccupancyRate =
    trend.length > 0 ? Math.round((trend.reduce((s, r) => s + r.occupancyRate, 0) / trend.length) * 100) / 100 : 0;

  return { totals: { ...totals, avgOccupancyRate }, trend, vehicleDistribution };
}
