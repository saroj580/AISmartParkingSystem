import { prisma } from "@/lib/prisma";
import { avatarColorFor } from "@/lib/avatar-color";
import type { Customer, VehicleType } from "@/types/domain";

export async function listCustomersForOperator(operatorId: string): Promise<Customer[]> {
  const bookings = await prisma.booking.findMany({
    where: { lot: { operatorId } },
    include: { driver: { include: { user: true } }, vehicle: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  const byDriver = new Map<
    string,
    {
      name: string;
      email: string;
      bookings: number;
      totalSpend: number;
      lastActive: Date;
      vehicleTypes: Set<VehicleType>;
    }
  >();

  for (const b of bookings) {
    const key = b.driverId;
    const existing = byDriver.get(key);
    const spend = b.payment?.status === "SUCCEEDED" ? Number(b.payment.amount) : 0;

    if (existing) {
      existing.bookings += 1;
      existing.totalSpend += spend;
      existing.vehicleTypes.add(b.vehicle.type);
      if (b.createdAt > existing.lastActive) existing.lastActive = b.createdAt;
    } else {
      byDriver.set(key, {
        name: `${b.driver.user.firstName} ${b.driver.user.lastName}`,
        email: b.driver.user.email,
        bookings: 1,
        totalSpend: spend,
        lastActive: b.createdAt,
        vehicleTypes: new Set([b.vehicle.type]),
      });
    }
  }

  const now = Date.now();
  return Array.from(byDriver.entries()).map(([driverId, c]) => {
    const daysSinceActive = (now - c.lastActive.getTime()) / 86_400_000;
    const status: Customer["status"] =
      daysSinceActive > 90 ? "churned" : c.bookings === 1 ? "new" : "active";

    return {
      id: driverId,
      name: c.name,
      email: c.email,
      avatarColor: avatarColorFor(driverId),
      bookings: c.bookings,
      totalSpend: c.totalSpend,
      lastActive: c.lastActive.toISOString(),
      status,
      vehicleTypes: Array.from(c.vehicleTypes),
    };
  });
}
