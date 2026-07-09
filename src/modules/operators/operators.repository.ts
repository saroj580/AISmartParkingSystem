import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaginationResult } from "@/helpers/pagination";

export const operatorsRepository = {
  findByUserId(userId: string) {
    return prisma.operatorProfile.findUnique({
      where: { userId },
      include: { user: true, _count: { select: { parkingLots: true } } },
    });
  },

  findById(id: string) {
    return prisma.operatorProfile.findUnique({
      where: { id },
      include: { user: true, _count: { select: { parkingLots: true } } },
    });
  },

  update(userId: string, data: Prisma.OperatorProfileUpdateInput) {
    return prisma.operatorProfile.update({ where: { userId }, data });
  },

  setVerified(id: string, isVerified: boolean) {
    return prisma.operatorProfile.update({ where: { id }, data: { isVerified } });
  },

  async list(pagination: PaginationResult) {
    const [items, total] = await Promise.all([
      prisma.operatorProfile.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
        include: { user: true, _count: { select: { parkingLots: true } } },
      }),
      prisma.operatorProfile.count(),
    ]);
    return { items, total };
  },
};
