import { prisma } from "@/lib/prisma";
import type { PaginationResult } from "@/helpers/pagination";

export const driversRepository = {
  findByUserId(userId: string) {
    return prisma.driverProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        _count: { select: { vehicles: true, bookings: true } },
      },
    });
  },

  async list(pagination: PaginationResult) {
    const [items, total] = await Promise.all([
      prisma.driverProfile.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
        include: { user: true, _count: { select: { vehicles: true, bookings: true } } },
      }),
      prisma.driverProfile.count(),
    ]);
    return { items, total };
  },
};
