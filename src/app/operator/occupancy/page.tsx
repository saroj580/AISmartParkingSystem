import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listSpacesForOperator } from "@/server/views/spaces";
import { listLotsForOperator } from "@/server/views/parking-lots";
import { OccupancyClient } from "@/components/operator/occupancy-client";

export default async function LiveOccupancyPage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const [spaces, lots] = await Promise.all([
    listSpacesForOperator(operatorProfile.id),
    listLotsForOperator(operatorProfile.id),
  ]);

  return <OccupancyClient lots={lots.map((l) => ({ id: l.id, name: l.name }))} spaces={spaces} />;
}
