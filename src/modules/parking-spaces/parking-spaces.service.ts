import { VehicleType, SpaceStatus } from "@prisma/client";
import { parkingSpacesRepository } from "@/modules/parking-spaces/parking-spaces.repository";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import type { BulkCreateSpacesInput, CreateSpaceInput, UpdateSpaceInput } from "@/modules/parking-spaces/parking-spaces.validators";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/errors/AppError";
import { cacheGetOrSet, invalidateCache, CacheKeys } from "@/lib/redis";
import { CACHE_TTL_SECONDS } from "@/constants/config";
import type { PaginationResult } from "@/helpers/pagination";

async function requireOwnedZone(userId: string, zoneId: string) {
  const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
  if (!operatorId) throw new ForbiddenError("Only operators can manage parking spaces");

  const zone = await parkingSpacesRepository.findZoneWithLot(zoneId);
  if (!zone) throw new NotFoundError("Parking zone");
  if (zone.lot.operatorId !== operatorId) throw new ForbiddenError("You do not own this parking lot");

  return zone;
}

async function requireOwnedSpace(userId: string, spaceId: string) {
  const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
  if (!operatorId) throw new ForbiddenError("Only operators can manage parking spaces");

  const space = await parkingSpacesRepository.findById(spaceId);
  if (!space) throw new NotFoundError("Parking space");
  if (space.lot.operatorId !== operatorId) throw new ForbiddenError("You do not own this parking space");

  return space;
}

async function invalidateAvailabilityCache(lotId: string) {
  await invalidateCache(`cache:availability:${lotId}:*`);
}

export const parkingSpacesService = {
  async create(userId: string, zoneId: string, input: CreateSpaceInput) {
    const zone = await requireOwnedZone(userId, zoneId);

    const existingCount = await parkingSpacesRepository.countExistingCodes(zone.lotId, [input.code]);
    if (existingCount > 0) {
      throw new ConflictError("A space with this code already exists in this lot");
    }

    const space = await parkingSpacesRepository.create({
      lotId: zone.lotId,
      zoneId: zone.id,
      code: input.code,
      vehicleType: zone.vehicleType,
    });

    await invalidateAvailabilityCache(zone.lotId);
    return space;
  },

  async bulkCreate(userId: string, zoneId: string, input: BulkCreateSpacesInput) {
    const zone = await requireOwnedZone(userId, zoneId);

    const codes = Array.from({ length: input.count }, (_, i) => {
      const index = input.startIndex + i;
      return `${input.prefix}-${String(index).padStart(3, "0")}`;
    });

    const existingCount = await parkingSpacesRepository.countExistingCodes(zone.lotId, codes);
    if (existingCount > 0) {
      throw new ConflictError("One or more generated space codes already exist in this lot");
    }

    await parkingSpacesRepository.createMany(
      codes.map((code) => ({
        lotId: zone.lotId,
        zoneId: zone.id,
        code,
        vehicleType: zone.vehicleType,
      }))
    );

    await invalidateAvailabilityCache(zone.lotId);
    return { created: codes.length, codes };
  },

  async listByLot(
    userId: string,
    lotId: string,
    filters: { vehicleType?: VehicleType; status?: SpaceStatus },
    pagination: PaginationResult
  ) {
    const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
    if (!operatorId) throw new ForbiddenError("Only operators can view parking spaces");

    const lot = await parkingLotsRepository.findById(lotId);
    if (!lot) throw new NotFoundError("Parking lot");
    if (lot.operatorId !== operatorId) throw new ForbiddenError("You do not own this parking lot");

    return parkingSpacesRepository.listByLot(lotId, filters, pagination);
  },

  async updateStatus(userId: string, spaceId: string, input: UpdateSpaceInput) {
    const space = await requireOwnedSpace(userId, spaceId);

    if (input.status && input.status !== space.status) {
      // RESERVED/OCCUPIED mean a live booking currently owns this space — only the booking/QR
      // flow (creation, check-in/out, expiry) may move it in or out of those states. Letting an
      // operator override it directly here would silently corrupt availability out from under
      // that booking (e.g. a car still parked showing as bookable again).
      if (space.status === "RESERVED" || space.status === "OCCUPIED") {
        throw new ConflictError(
          "This space has a live booking in progress — it can't be manually changed until that booking completes, is checked out, or is cancelled"
        );
      }
      if (input.status === "RESERVED" || input.status === "OCCUPIED") {
        throw new BadRequestError("RESERVED and OCCUPIED are set automatically by the booking flow and can't be assigned directly");
      }
    }

    const updated = await parkingSpacesRepository.update(spaceId, input);
    await invalidateAvailabilityCache(space.lotId);
    return updated;
  },

  /** Public availability summary — counts only, computed from current space status (never IoT). */
  async getAvailabilitySummary(lotId: string) {
    return cacheGetOrSet(CacheKeys.lotAvailabilitySummary(lotId), CACHE_TTL_SECONDS.lotAvailability, async () => {
      const rows = await parkingSpacesRepository.availabilitySummary(lotId);

      const summary: Record<VehicleType, Record<SpaceStatus, number>> = {
        TWO_WHEELER: { AVAILABLE: 0, RESERVED: 0, OCCUPIED: 0, MAINTENANCE: 0 },
        THREE_WHEELER: { AVAILABLE: 0, RESERVED: 0, OCCUPIED: 0, MAINTENANCE: 0 },
        FOUR_WHEELER: { AVAILABLE: 0, RESERVED: 0, OCCUPIED: 0, MAINTENANCE: 0 },
      };

      for (const row of rows) {
        summary[row.vehicleType][row.status] = row._count._all;
      }

      return summary;
    });
  },
};
