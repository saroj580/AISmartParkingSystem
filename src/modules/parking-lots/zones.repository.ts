import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const zonesRepository = {
  create(data: Prisma.ParkingZoneUncheckedCreateInput) {
    return prisma.parkingZone.create({ data });
  },

  findById(id: string) {
    return prisma.parkingZone.findUnique({ where: { id }, include: { lot: true, _count: { select: { spaces: true } } } });
  },

  listByLot(lotId: string) {
    return prisma.parkingZone.findMany({
      where: { lotId },
      include: { _count: { select: { spaces: true } } },
      orderBy: { name: "asc" },
    });
  },

  update(id: string, data: Prisma.ParkingZoneUpdateInput) {
    return prisma.parkingZone.update({ where: { id }, data });
  },
};
