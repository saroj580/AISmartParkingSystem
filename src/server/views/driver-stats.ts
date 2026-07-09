import { prisma } from "@/lib/prisma";

export interface DriverStats {
  totalBookings: number;
  hoursParked: number;
  totalSpent: number;
  co2SavedKg: number;
}

export async function getDriverStats(driverId: string): Promise<DriverStats> {
  const [totalBookings, completed, payments] = await Promise.all([
    prisma.booking.count({ where: { driverId } }),
    prisma.booking.findMany({
      where: { driverId, status: "COMPLETED", actualCheckInAt: { not: null }, actualCheckOutAt: { not: null } },
      select: { actualCheckInAt: true, actualCheckOutAt: true },
    }),
    prisma.payment.aggregate({
      where: { driverId, status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
  ]);

  const hoursParked = completed.reduce((sum, b) => {
    const ms = b.actualCheckOutAt!.getTime() - b.actualCheckInAt!.getTime();
    return sum + ms / 3_600_000;
  }, 0);

  return {
    totalBookings,
    hoursParked: Math.round(hoursParked),
    totalSpent: Number(payments._sum.amount ?? 0),
    // Rough estimate: parking instead of circling for a spot saves ~0.15kg CO2 per hour parked.
    co2SavedKg: Math.round(hoursParked * 0.15),
  };
}
