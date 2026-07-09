import type { VehicleType } from "@prisma/client";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { parkingSpacesService } from "@/modules/parking-spaces/parking-spaces.service";
import type { CreateLotInput, UpdateLotInput } from "@/modules/parking-lots/parking-lots.validators";
import { geocodeAddress, haversineDistanceKm, boundingBoxForRadius } from "@/lib/maps";
import { ForbiddenError, NotFoundError, BadRequestError } from "@/errors/AppError";
import { cacheGetOrSet, CacheKeys } from "@/lib/redis";
import { CACHE_TTL_SECONDS } from "@/constants/config";
import type { PaginationResult } from "@/helpers/pagination";

async function requireOperatorId(userId: string): Promise<string> {
  const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
  if (!operatorId) throw new ForbiddenError("Only operators can manage parking lots");
  return operatorId;
}

export const parkingLotsService = {
  async create(userId: string, input: CreateLotInput) {
    const operatorId = await requireOperatorId(userId);

    let latitude = input.latitude;
    let longitude = input.longitude;

    if (latitude === undefined || longitude === undefined) {
      const geocoded = await geocodeAddress(
        `${input.addressLine}, ${input.city}, ${input.state ?? ""} ${input.postalCode ?? ""}, ${input.country}`
      );
      latitude = geocoded.latitude;
      longitude = geocoded.longitude;
    }

    return parkingLotsRepository.create({
      operatorId,
      name: input.name,
      description: input.description,
      addressLine: input.addressLine,
      city: input.city,
      state: input.state,
      country: input.country,
      postalCode: input.postalCode,
      latitude,
      longitude,
      openTime: input.openTime,
      closeTime: input.closeTime,
      amenities: input.amenities,
      images: input.images,
    });
  },

  async getById(lotId: string) {
    const lot = await parkingLotsRepository.findById(lotId);
    if (!lot) throw new NotFoundError("Parking lot");
    return lot;
  },

  async update(userId: string, lotId: string, input: UpdateLotInput) {
    const operatorId = await requireOperatorId(userId);
    const lot = await parkingLotsRepository.findById(lotId);
    if (!lot) throw new NotFoundError("Parking lot");
    if (lot.operatorId !== operatorId) throw new ForbiddenError("You do not own this parking lot");

    return parkingLotsRepository.update(lotId, input);
  },

  async listMine(userId: string, pagination: PaginationResult) {
    const operatorId = await requireOperatorId(userId);
    return parkingLotsRepository.listByOperator(operatorId, pagination);
  },

  async listPublic(pagination: PaginationResult, filters: { city?: string; search?: string }) {
    return parkingLotsRepository.listAll(pagination, filters);
  },

  async searchNearby(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    vehicleType?: VehicleType;
    page: number;
    limit: number;
  }) {
    if (Number.isNaN(params.latitude) || Number.isNaN(params.longitude)) {
      throw new BadRequestError("Invalid coordinates");
    }

    const cacheKey = CacheKeys.nearbyLots(params.latitude, params.longitude, params.radiusKm, params.vehicleType);

    const ranked = await cacheGetOrSet(cacheKey, CACHE_TTL_SECONDS.nearbyLots, async () => {
      const box = boundingBoxForRadius(params.latitude, params.longitude, params.radiusKm);
      const lots = await parkingLotsRepository.findWithinBoundingBox(box, params.vehicleType);

      return lots
        .map((lot) => ({
          ...lot,
          distanceKm: Number(
            haversineDistanceKm(params, { latitude: lot.latitude, longitude: lot.longitude }).toFixed(2)
          ),
        }))
        .filter((lot) => lot.distanceKm <= params.radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    });

    const start = (params.page - 1) * params.limit;
    const page = ranked.slice(start, start + params.limit);

    const enriched = await Promise.all(
      page.map(async (lot) => ({
        ...lot,
        availability: await parkingSpacesService.getAvailabilitySummary(lot.id),
      }))
    );

    return { items: enriched, total: ranked.length };
  },
};
