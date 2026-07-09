import { vehiclesRepository } from "@/modules/vehicles/vehicles.repository";
import type { CreateVehicleInput, UpdateVehicleInput } from "@/modules/vehicles/vehicles.validators";
import { ConflictError, ForbiddenError, NotFoundError, BadRequestError } from "@/errors/AppError";
import type { PaginationResult } from "@/helpers/pagination";

async function requireDriverId(userId: string): Promise<string> {
  const driverId = await vehiclesRepository.getDriverIdForUser(userId);
  if (!driverId) throw new ForbiddenError("Only drivers can manage vehicles");
  return driverId;
}

async function requireOwnedVehicle(driverId: string, vehicleId: string) {
  const vehicle = await vehiclesRepository.findById(vehicleId);
  if (!vehicle || vehicle.driverId !== driverId) {
    throw new NotFoundError("Vehicle");
  }
  return vehicle;
}

export const vehiclesService = {
  async create(userId: string, input: CreateVehicleInput) {
    const driverId = await requireDriverId(userId);

    const existing = await vehiclesRepository.findByPlateNumber(input.plateNumber);
    if (existing) {
      throw new ConflictError("A vehicle with this plate number is already registered");
    }

    const vehicle = await vehiclesRepository.create({
      driverId,
      plateNumber: input.plateNumber,
      type: input.type,
      make: input.make,
      model: input.model,
      color: input.color,
      isDefault: input.isDefault,
    });

    if (vehicle.isDefault) {
      await vehiclesRepository.unsetDefaultForOthers(driverId, vehicle.id);
    }

    return vehicle;
  },

  async listMine(userId: string, pagination: PaginationResult) {
    const driverId = await requireDriverId(userId);
    return vehiclesRepository.listByDriver(driverId, pagination);
  },

  async getMine(userId: string, vehicleId: string) {
    const driverId = await requireDriverId(userId);
    return requireOwnedVehicle(driverId, vehicleId);
  },

  async update(userId: string, vehicleId: string, input: UpdateVehicleInput) {
    const driverId = await requireDriverId(userId);
    await requireOwnedVehicle(driverId, vehicleId);

    const vehicle = await vehiclesRepository.update(vehicleId, input);

    if (input.isDefault) {
      await vehiclesRepository.unsetDefaultForOthers(driverId, vehicleId);
    }

    return vehicle;
  },

  async remove(userId: string, vehicleId: string) {
    const driverId = await requireDriverId(userId);
    await requireOwnedVehicle(driverId, vehicleId);

    const activeBookings = await vehiclesRepository.hasActiveBookings(vehicleId);
    if (activeBookings > 0) {
      throw new BadRequestError("Cannot remove a vehicle with active or pending bookings");
    }

    await vehiclesRepository.update(vehicleId, { isActive: false });
  },
};
