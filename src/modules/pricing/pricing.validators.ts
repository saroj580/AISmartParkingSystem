import { z } from "zod";
import { VehicleType } from "@prisma/client";

export const createPricingRuleSchema = z.object({
  vehicleType: z.nativeEnum(VehicleType),
  name: z.string().trim().min(1).max(100),
  baseRatePerHour: z.number().positive(),
  dailyMaxRate: z.number().positive().optional(),
  weekendMultiplier: z.number().min(1).max(5).default(1),
  currency: z.string().trim().length(3).default("usd"),
  effectiveFrom: z.coerce.date().default(() => new Date()),
  effectiveTo: z.coerce.date().optional(),
});

export type CreatePricingRuleInput = z.infer<typeof createPricingRuleSchema>;

export const updatePricingRuleSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  baseRatePerHour: z.number().positive().optional(),
  dailyMaxRate: z.number().positive().optional(),
  weekendMultiplier: z.number().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
  effectiveTo: z.coerce.date().optional(),
});

export type UpdatePricingRuleInput = z.infer<typeof updatePricingRuleSchema>;
