import type { Vehicle as PrismaVehicle } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Vehicle } from "@/types/domain";

function toVehicleVM(v: PrismaVehicle): Vehicle {
  return {
    id: v.id,
    plateNumber: v.plateNumber,
    type: v.type,
    make: v.make ?? "",
    model: v.model ?? "",
    color: v.color ?? "",
    isDefault: v.isDefault,
    isActive: v.isActive,
  };
}

export async function listDriverVehicles(driverId: string): Promise<Vehicle[]> {
  const rows = await prisma.vehicle.findMany({
    where: { driverId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toVehicleVM);
}
