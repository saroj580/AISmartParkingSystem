import type { Prisma, VehicleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const pricingRepository = {
  create(data: Prisma.PricingRuleUncheckedCreateInput) {
    return prisma.pricingRule.create({ data });
  },

  findById(id: string) {
    return prisma.pricingRule.findUnique({ where: { id }, include: { lot: true } });
  },

  listByLot(lotId: string) {
    return prisma.pricingRule.findMany({ where: { lotId }, orderBy: { createdAt: "desc" } });
  },

  update(id: string, data: Prisma.PricingRuleUpdateInput) {
    return prisma.pricingRule.update({ where: { id }, data });
  },

  /** The currently effective rule for a lot + vehicle type, used to price a new booking. */
  findActiveRule(lotId: string, vehicleType: VehicleType, at: Date = new Date()) {
    return prisma.pricingRule.findFirst({
      where: {
        lotId,
        vehicleType,
        isActive: true,
        effectiveFrom: { lte: at },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: at } }],
      },
      orderBy: { effectiveFrom: "desc" },
    });
  },
};
