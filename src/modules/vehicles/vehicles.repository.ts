import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaginationResult } from "@/helpers/pagination";

export const vehiclesRepository = {
  async getDriverIdForUser(userId: string): Promise<string | null> {
    const profile = await prisma.driverProfile.findUnique({ where: { userId }, select: { id: true } });
    return profile?.id ?? null;
  },

  findByPlateNumber(plateNumber: string) {
    return prisma.vehicle.findUnique({ where: { plateNumber } });
  },

  findById(id: string) {
    return prisma.vehicle.findUnique({ where: { id } });
  },

  create(data: Prisma.VehicleUncheckedCreateInput) {
    return prisma.vehicle.create({ data });
  },

  update(id: string, data: Prisma.VehicleUpdateInput) {
    return prisma.vehicle.update({ where: { id }, data });
  },

  unsetDefaultForOthers(driverId: string, exceptVehicleId: string) {
    return prisma.vehicle.updateMany({
      where: { driverId, id: { not: exceptVehicleId }, isDefault: true },
      data: { isDefault: false },
    });
  },

  async listByDriver(driverId: string, pagination: PaginationResult) {
    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: { driverId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
      prisma.vehicle.count({ where: { driverId } }),
    ]);
    return { items, total };
  },

  hasActiveBookings(vehicleId: string) {
    return prisma.booking.count({
      where: { vehicleId, status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] } },
    });
  },
};
