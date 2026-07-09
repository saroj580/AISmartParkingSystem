import { prisma } from "@/lib/prisma";
import { cacheGetOrSet, CacheKeys } from "@/lib/redis";
import { CACHE_TTL_SECONDS } from "@/constants/config";

/** Platform-wide overview for the admin console — distinct from per-operator dashboards. */
export const adminService = {
  async getPlatformOverview() {
    return cacheGetOrSet(CacheKeys.dashboardMetrics("platform"), CACHE_TTL_SECONDS.dashboardMetrics, async () => {
      const [usersByRole, totalLots, bookingsByStatus, revenueAgg, totalVehicles] = await Promise.all([
        prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
        prisma.parkingLot.count(),
        prisma.booking.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
        prisma.vehicle.count(),
      ]);

      return {
        users: {
          total: usersByRole.reduce((sum, row) => sum + row._count._all, 0),
          byRole: Object.fromEntries(usersByRole.map((row) => [row.role, row._count._all])),
        },
        parkingLots: { total: totalLots },
        vehicles: { total: totalVehicles },
        bookings: {
          total: bookingsByStatus.reduce((sum, row) => sum + row._count._all, 0),
          byStatus: Object.fromEntries(bookingsByStatus.map((row) => [row.status, row._count._all])),
        },
        revenue: { total: revenueAgg._sum.amount ?? 0 },
        generatedAt: new Date().toISOString(),
      };
    });
  },
};
