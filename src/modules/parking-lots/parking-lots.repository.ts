import type { Prisma, VehicleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaginationResult } from "@/helpers/pagination";
import type { BoundingBox } from "@/modules/parking-lots/parking-lots.types";

export const parkingLotsRepository = {
  async getOperatorIdForUser(userId: string): Promise<string | null> {
    const profile = await prisma.operatorProfile.findUnique({ where: { userId }, select: { id: true } });
    return profile?.id ?? null;
  },

  create(data: Prisma.ParkingLotUncheckedCreateInput) {
    return prisma.parkingLot.create({ data });
  },

  findById(id: string) {
    return prisma.parkingLot.findUnique({ where: { id }, include: { zones: true } });
  },

  update(id: string, data: Prisma.ParkingLotUpdateInput) {
    return prisma.parkingLot.update({ where: { id }, data });
  },

  async listByOperator(operatorId: string, pagination: PaginationResult) {
    const [items, total] = await Promise.all([
      prisma.parkingLot.findMany({
        where: { operatorId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.parkingLot.count({ where: { operatorId } }),
    ]);
    return { items, total };
  },

  /** Cheap bounding-box pre-filter; precise distance ranking happens in the service layer via haversine. */
  findWithinBoundingBox(box: BoundingBox, vehicleType?: VehicleType) {
    return prisma.parkingLot.findMany({
      where: {
        status: "ACTIVE",
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLng, lte: box.maxLng },
        ...(vehicleType ? { spaces: { some: { vehicleType, isActive: true } } } : {}),
      },
      take: 200,
    });
  },

  async listAll(pagination: PaginationResult, filters: { city?: string; search?: string }) {
    const where: Prisma.ParkingLotWhereInput = {
      status: "ACTIVE",
      ...(filters.city ? { city: { equals: filters.city, mode: "insensitive" } } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: "insensitive" } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.parkingLot.findMany({ where, skip: pagination.skip, take: pagination.take, orderBy: { createdAt: "desc" } }),
      prisma.parkingLot.count({ where }),
    ]);
    return { items, total };
  },
};
