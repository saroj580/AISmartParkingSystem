import type { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface DailyMetrics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalRefunds: number;
  occupiedSpaceHours: number;
  avgOccupancyRate: number;
  peakHour: number | null;
  newCustomers: number;
  vehicleTypeBreakdown: Record<string, number>;
}

export const analyticsRepository = {
  async upsertDaily(lotId: string, date: Date, metrics: DailyMetrics) {
    return prisma.analyticsDaily.upsert({
      where: { lotId_date: { lotId, date } },
      create: { lotId, date, ...metrics },
      update: { ...metrics },
    });
  },

  getRangeForLot(lotId: string, from: Date, to: Date) {
    return prisma.analyticsDaily.findMany({
      where: { lotId, date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });
  },

  getRangeForOperator(operatorId: string, from: Date, to: Date) {
    return prisma.analyticsDaily.findMany({
      where: { lot: { operatorId }, date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });
  },

  getRangeForAllLots(from: Date, to: Date) {
    return prisma.analyticsDaily.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });
  },

  countActiveSpaces(lotId: string) {
    return prisma.parkingSpace.count({ where: { lotId, isActive: true } });
  },

  countBookingsByStatusInRange(lotId: string, status: BookingStatus, from: Date, to: Date) {
    return prisma.booking.count({ where: { lotId, status, startTime: { gte: from, lt: to } } });
  },

  countBookingsInRange(lotId: string, from: Date, to: Date) {
    return prisma.booking.count({ where: { lotId, startTime: { gte: from, lt: to } } });
  },

  async sumRevenueInRange(lotId: string, from: Date, to: Date) {
    const result = await prisma.payment.aggregate({
      where: { status: "SUCCEEDED", paidAt: { gte: from, lt: to }, booking: { lotId } },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  },

  async sumRefundsInRange(lotId: string, from: Date, to: Date) {
    const result = await prisma.refund.aggregate({
      where: { status: "SUCCEEDED", createdAt: { gte: from, lt: to }, payment: { booking: { lotId } } },
      _sum: { amount: true },
    });
    return Number(result._sum.amount ?? 0);
  },

  async completedBookingsForOccupancy(lotId: string, from: Date, to: Date) {
    return prisma.booking.findMany({
      where: { lotId, status: "COMPLETED", startTime: { gte: from, lt: to } },
      select: { startTime: true, endTime: true, vehicle: { select: { type: true } } },
    });
  },

  async peakHour(lotId: string, from: Date, to: Date): Promise<number | null> {
    const rows = await prisma.$queryRaw<{ hour: number; count: bigint }[]>`
      SELECT EXTRACT(HOUR FROM "startTime")::int AS hour, COUNT(*)::bigint AS count
      FROM bookings
      WHERE "lotId" = ${lotId} AND "startTime" >= ${from} AND "startTime" < ${to}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `;
    return rows[0]?.hour ?? null;
  },

  async newCustomersOnDate(lotId: string, from: Date, to: Date): Promise<number> {
    const rows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count FROM (
        SELECT "driverId",
               (ARRAY_AGG("lotId" ORDER BY "startTime" ASC))[1] AS first_lot,
               MIN("startTime") AS first_time
        FROM bookings
        GROUP BY "driverId"
      ) first_bookings
      WHERE first_lot = ${lotId} AND first_time >= ${from} AND first_time < ${to}
    `;
    return Number(rows[0]?.count ?? 0);
  },
};
