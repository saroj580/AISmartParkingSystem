import { prisma } from "@/lib/prisma";
import { vehiclesRepository } from "@/modules/vehicles/vehicles.repository";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { analyticsService } from "@/modules/analytics/analytics.service";
import { adminService } from "@/modules/admin/admin.service";
import { ForbiddenError } from "@/errors/AppError";

function last7Days() {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 86_400_000);
  return { from, to };
}

export const dashboardService = {
  async getDriverDashboard(userId: string) {
    const driverId = await vehiclesRepository.getDriverIdForUser(userId);
    if (!driverId) throw new ForbiddenError("Only drivers have a driver dashboard");

    const [activeBookings, upcomingBooking, vehicleCount, profile] = await Promise.all([
      prisma.booking.findMany({
        where: { driverId, status: { in: ["CONFIRMED", "ACTIVE"] } },
        include: { lot: true, space: true, vehicle: true },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      prisma.booking.findFirst({
        where: { driverId, status: "PENDING" },
        orderBy: { startTime: "asc" },
      }),
      prisma.vehicle.count({ where: { driverId, isActive: true } }),
      prisma.driverProfile.findUnique({ where: { id: driverId } }),
    ]);

    return {
      activeBookings,
      upcomingBooking,
      vehicleCount,
      loyaltyPoints: profile?.loyaltyPoints ?? 0,
    };
  },

  async getOperatorDashboard(userId: string) {
    const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
    if (!operatorId) throw new ForbiddenError("Only operators have an operator dashboard");

    const { from, to } = last7Days();

    const [lotCount, activeBookingsCount, analytics] = await Promise.all([
      prisma.parkingLot.count({ where: { operatorId } }),
      prisma.booking.count({ where: { lot: { operatorId }, status: { in: ["CONFIRMED", "ACTIVE"] } } }),
      analyticsService.getForOperator(userId, from, to),
    ]);

    return { lotCount, activeBookingsCount, last7Days: analytics };
  },

  async getAdminDashboard() {
    const { from, to } = last7Days();
    const [overview, analytics] = await Promise.all([
      adminService.getPlatformOverview(),
      analyticsService.getPlatform(from, to),
    ]);

    return { overview, last7Days: analytics };
  },
};
