"use server";

import { revalidatePath } from "next/cache";
import type { VehicleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { parkingLotsService } from "@/modules/parking-lots/parking-lots.service";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { zonesRepository } from "@/modules/parking-lots/zones.repository";
import { pricingRepository } from "@/modules/pricing/pricing.repository";

const ZONE_LABEL: Record<VehicleType, string> = {
  TWO_WHEELER: "Zone A - Two Wheeler",
  THREE_WHEELER: "Zone B - Three Wheeler",
  FOUR_WHEELER: "Zone C - Four Wheeler",
};

interface VehicleTypeConfig {
  enabled: boolean;
  spaceCount: number;
  baseRatePerHour: number;
  dailyMaxRate: number;
}

export interface CreateParkingLotInput {
  name: string;
  description?: string;
  addressLine: string;
  city: string;
  state?: string;
  postalCode?: string;
  vehicleTypes: Record<VehicleType, VehicleTypeConfig>;
}

export async function createParkingLot(input: CreateParkingLotInput) {
  const session = await getSessionUser();
  if (!session || session.role !== "OPERATOR") {
    return { success: false as const, error: "Please sign in as an operator to add a parking lot." };
  }

  const enabledTypes = (Object.entries(input.vehicleTypes) as [VehicleType, VehicleTypeConfig][]).filter(
    ([, cfg]) => cfg.enabled
  );
  if (enabledTypes.length === 0) {
    return { success: false as const, error: "Enable at least one vehicle type." };
  }

  try {
    const lot = await parkingLotsService.create(session.id, {
      name: input.name,
      description: input.description,
      addressLine: input.addressLine,
      city: input.city,
      state: input.state,
      country: "India",
      postalCode: input.postalCode,
      openTime: "00:00",
      closeTime: "23:59",
      amenities: [],
      images: [],
    });

    for (const [type, cfg] of enabledTypes) {
      const zone = await zonesRepository.create({
        lotId: lot.id,
        name: ZONE_LABEL[type],
        vehicleType: type,
      });

      await prisma.parkingSpace.createMany({
        data: Array.from({ length: cfg.spaceCount }, (_, i) => ({
          lotId: lot.id,
          zoneId: zone.id,
          code: `${zone.name.slice(5, 6)}-${String(i + 1).padStart(3, "0")}`,
          vehicleType: type,
        })),
      });

      await pricingRepository.create({
        lotId: lot.id,
        vehicleType: type,
        name: "Standard",
        baseRatePerHour: cfg.baseRatePerHour,
        dailyMaxRate: cfg.dailyMaxRate,
        currency: "inr",
      });
    }

    revalidatePath("/operator/lots");
    revalidatePath("/operator");
    revalidatePath("/driver/parking");

    return { success: true as const, lotId: lot.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't create parking lot.";
    return { success: false as const, error: message };
  }
}

export async function getOperatorIdForCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;
  return parkingLotsRepository.getOperatorIdForUser(session.id);
}
