import type { PricingRule, VehicleType } from "@prisma/client";
import { pricingRepository } from "@/modules/pricing/pricing.repository";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import type { CreatePricingRuleInput, UpdatePricingRuleInput } from "@/modules/pricing/pricing.validators";
import { ForbiddenError, NotFoundError, BadRequestError } from "@/errors/AppError";

async function requireOwnedLot(userId: string, lotId: string) {
  const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
  if (!operatorId) throw new ForbiddenError("Only operators can manage pricing rules");

  const lot = await parkingLotsRepository.findById(lotId);
  if (!lot) throw new NotFoundError("Parking lot");
  if (lot.operatorId !== operatorId) throw new ForbiddenError("You do not own this parking lot");
}

export const pricingService = {
  async create(userId: string, lotId: string, input: CreatePricingRuleInput) {
    await requireOwnedLot(userId, lotId);
    return pricingRepository.create({
      lotId,
      vehicleType: input.vehicleType,
      name: input.name,
      baseRatePerHour: input.baseRatePerHour,
      dailyMaxRate: input.dailyMaxRate,
      weekendMultiplier: input.weekendMultiplier,
      currency: input.currency,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
    });
  },

  async listByLot(lotId: string) {
    return pricingRepository.listByLot(lotId);
  },

  async update(userId: string, ruleId: string, input: UpdatePricingRuleInput) {
    const rule = await pricingRepository.findById(ruleId);
    if (!rule) throw new NotFoundError("Pricing rule");

    const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
    if (!operatorId || rule.lot.operatorId !== operatorId) {
      throw new ForbiddenError("You do not own this pricing rule");
    }

    return pricingRepository.update(ruleId, input);
  },

  async getActiveRule(lotId: string, vehicleType: VehicleType, at?: Date) {
    const rule = await pricingRepository.findActiveRule(lotId, vehicleType, at);
    if (!rule) {
      throw new BadRequestError(`No active pricing rule found for ${vehicleType} at this parking lot`);
    }
    return rule;
  },

  /**
   * Splits the booking window into calendar-day segments so weekend multipliers and daily caps
   * apply per-day rather than to the whole (potentially multi-day) booking.
   */
  calculateBookingCost(rule: PricingRule, startTime: Date, endTime: Date): number {
    if (endTime <= startTime) {
      throw new BadRequestError("endTime must be after startTime");
    }

    const baseRate = Number(rule.baseRatePerHour);
    const weekendMultiplier = Number(rule.weekendMultiplier);
    const dailyMaxRate = rule.dailyMaxRate ? Number(rule.dailyMaxRate) : undefined;

    let total = 0;
    let cursor = new Date(startTime);

    while (cursor < endTime) {
      const dayBoundary = new Date(cursor);
      dayBoundary.setHours(24, 0, 0, 0);
      const segmentEnd = dayBoundary < endTime ? dayBoundary : endTime;

      const hours = (segmentEnd.getTime() - cursor.getTime()) / 3_600_000;
      const isWeekend = cursor.getDay() === 0 || cursor.getDay() === 6;
      const hourlyRate = isWeekend ? baseRate * weekendMultiplier : baseRate;

      let dayCost = hourlyRate * hours;
      if (dailyMaxRate !== undefined) {
        dayCost = Math.min(dayCost, dailyMaxRate);
      }

      total += dayCost;
      cursor = segmentEnd;
    }

    return Math.round(total * 100) / 100;
  },
};
