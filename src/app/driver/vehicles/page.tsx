import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listDriverVehicles } from "@/server/views/vehicles";
import { VehiclesClient } from "@/components/driver/vehicles-client";

export default async function VehiclesPage() {
  const session = await getSessionUser();
  const driverProfile = await prisma.driverProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const vehicles = await listDriverVehicles(driverProfile.id);

  return <VehiclesClient vehicles={vehicles} />;
}
