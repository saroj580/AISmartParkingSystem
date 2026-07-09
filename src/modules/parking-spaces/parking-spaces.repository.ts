import type { Prisma, SpaceStatus, VehicleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaginationResult } from "@/helpers/pagination";

export const parkingSpacesRepository = {
  findZoneWithLot(zoneId: string) {
    return prisma.parkingZone.findUnique({ where: { id: zoneId }, include: { lot: true } });
  },

  findById(id: string) {
    return prisma.parkingSpace.findUnique({ where: { id }, include: { lot: true, zone: true } });
  },

  create(data: Prisma.ParkingSpaceUncheckedCreateInput) {
    return prisma.parkingSpace.create({ data });
  },

  createMany(data: Prisma.ParkingSpaceCreateManyInput[]) {
    return prisma.parkingSpace.createMany({ data });
  },

  update(id: string, data: Prisma.ParkingSpaceUpdateInput) {
    return prisma.parkingSpace.update({ where: { id }, data });
  },

  async listByLot(
    lotId: string,
    filters: { vehicleType?: VehicleType; status?: SpaceStatus },
    pagination: PaginationResult
  ) {
    const where: Prisma.ParkingSpaceWhereInput = {
      lotId,
      ...(filters.vehicleType ? { vehicleType: filters.vehicleType } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.parkingSpace.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { code: "asc" },
      }),
      prisma.parkingSpace.count({ where }),
    ]);

    return { items, total };
  },

  countExistingCodes(lotId: string, codes: string[]) {
    return prisma.parkingSpace.count({ where: { lotId, code: { in: codes } } });
  },

  /** Grouped counts by vehicle type + status — the basis for computed (non-IoT) availability. */
  async availabilitySummary(lotId: string) {
    const rows = await prisma.parkingSpace.groupBy({
      by: ["vehicleType", "status"],
      where: { lotId, isActive: true },
      _count: { _all: true },
    });
    return rows;
  },
};
