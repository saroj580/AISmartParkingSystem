import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { zonesRepository } from "@/modules/parking-lots/zones.repository";
import type { CreateZoneInput, UpdateZoneInput } from "@/modules/parking-lots/zones.validators";
import { ConflictError, ForbiddenError, NotFoundError } from "@/errors/AppError";

async function requireOwnedLot(userId: string, lotId: string) {
  const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
  if (!operatorId) throw new ForbiddenError("Only operators can manage parking zones");

  const lot = await parkingLotsRepository.findById(lotId);
  if (!lot) throw new NotFoundError("Parking lot");
  if (lot.operatorId !== operatorId) throw new ForbiddenError("You do not own this parking lot");

  return lot;
}

export const zonesService = {
  async create(userId: string, lotId: string, input: CreateZoneInput) {
    await requireOwnedLot(userId, lotId);

    try {
      return await zonesRepository.create({ lotId, name: input.name, vehicleType: input.vehicleType, floor: input.floor });
    } catch (err) {
      if ((err as { code?: string }).code === "P2002") {
        throw new ConflictError("A zone with this name already exists in this lot");
      }
      throw err;
    }
  },

  async listByLot(lotId: string) {
    return zonesRepository.listByLot(lotId);
  },

  async update(userId: string, zoneId: string, input: UpdateZoneInput) {
    const zone = await zonesRepository.findById(zoneId);
    if (!zone) throw new NotFoundError("Parking zone");

    const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
    if (!operatorId || zone.lot.operatorId !== operatorId) {
      throw new ForbiddenError("You do not own this parking zone");
    }

    return zonesRepository.update(zoneId, input);
  },
};
