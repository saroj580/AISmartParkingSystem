import type { ParkingLot as PrismaParkingLot, OperatorProfile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parkingSpacesService } from "@/modules/parking-spaces/parking-spaces.service";
import { pricingRepository } from "@/modules/pricing/pricing.repository";
import { VEHICLE_TYPES } from "@/constants/vehicles";
import { avatarColorFor } from "@/lib/avatar-color";
import type { ParkingLot, Capacity, PricingByType, VehicleType } from "@/types/domain";

type LotRow = PrismaParkingLot & { operator: OperatorProfile };

async function toParkingLotVM(lot: LotRow): Promise<ParkingLot> {
  const [availability, rules] = await Promise.all([
    parkingSpacesService.getAvailabilitySummary(lot.id),
    pricingRepository.listByLot(lot.id),
  ]);

  const capacity = {} as Capacity;
  const pricing = {} as Record<VehicleType, PricingByType>;

  for (const type of VEHICLE_TYPES) {
    const statuses = availability[type];
    capacity[type] = {
      total: statuses.AVAILABLE + statuses.RESERVED + statuses.OCCUPIED + statuses.MAINTENANCE,
      available: statuses.AVAILABLE,
    };

    const rule = rules.find((r) => r.vehicleType === type && r.isActive);
    pricing[type] = {
      baseRatePerHour: rule ? Number(rule.baseRatePerHour) : 0,
      dailyMaxRate: rule?.dailyMaxRate ? Number(rule.dailyMaxRate) : 0,
      currency: rule?.currency ?? "inr",
    };
  }

  return {
    id: lot.id,
    name: lot.name,
    operatorId: lot.operatorId,
    operatorName: lot.operator.companyName,
    description: lot.description ?? "",
    addressLine: lot.addressLine,
    city: lot.city,
    state: lot.state ?? "",
    country: lot.country,
    postalCode: lot.postalCode ?? "",
    latitude: lot.latitude,
    longitude: lot.longitude,
    status: lot.status,
    openTime: lot.openTime,
    closeTime: lot.closeTime,
    amenities: lot.amenities,
    images: lot.images,
    rating: 4.6,
    reviewCount: 0,
    distanceKm: 0,
    capacity,
    pricing,
    coverColor: avatarColorFor(lot.id),
  };
}

export async function listActiveParkingLots(): Promise<ParkingLot[]> {
  const lots = await prisma.parkingLot.findMany({
    where: { status: "ACTIVE" },
    include: { operator: true },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(lots.map(toParkingLotVM));
}

export async function getParkingLotDetail(id: string): Promise<ParkingLot | null> {
  const lot = await prisma.parkingLot.findUnique({ where: { id }, include: { operator: true } });
  if (!lot) return null;
  return toParkingLotVM(lot);
}

export async function listLotsForOperator(operatorId: string): Promise<ParkingLot[]> {
  const lots = await prisma.parkingLot.findMany({
    where: { operatorId },
    include: { operator: true },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(lots.map(toParkingLotVM));
}

/** Verifies the lot belongs to this operator before returning it. */
export async function getOwnedLotDetail(operatorId: string, lotId: string): Promise<ParkingLot | null> {
  const lot = await prisma.parkingLot.findUnique({ where: { id: lotId }, include: { operator: true } });
  if (!lot || lot.operatorId !== operatorId) return null;
  return toParkingLotVM(lot);
}
