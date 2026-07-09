import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ListUsersFilters {
  role?: Role;
  search?: string;
  skip: number;
  take: number;
  sortOrder: "asc" | "desc";
}

export const usersRepository = {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { driverProfile: true, operatorProfile: true, adminProfile: true },
    });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  async list(filters: ListUsersFilters) {
    const where: Prisma.UserWhereInput = {
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.search
        ? {
            OR: [
              { email: { contains: filters.search, mode: "insensitive" } },
              { firstName: { contains: filters.search, mode: "insensitive" } },
              { lastName: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: filters.sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  },
};
