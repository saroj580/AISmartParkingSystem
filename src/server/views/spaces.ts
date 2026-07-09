import { prisma } from "@/lib/prisma";
import type { SpaceStatus, VehicleType } from "@/types/domain";

export interface OperatorSpaceRow {
  id: string;
  code: string;
  lotId: string;
  lotName: string;
  zoneName: string;
  vehicleType: VehicleType;
  status: SpaceStatus;
}

export async function listSpacesForOperator(operatorId: string): Promise<OperatorSpaceRow[]> {
  const rows = await prisma.parkingSpace.findMany({
    where: { lot: { operatorId }, isActive: true },
    include: { lot: true, zone: true },
    orderBy: [{ lotId: "asc" }, { code: "asc" }],
  });

  return rows.map((s) => ({
    id: s.id,
    code: s.code,
    lotId: s.lotId,
    lotName: s.lot.name,
    zoneName: s.zone.name,
    vehicleType: s.vehicleType,
    status: s.status,
  }));
}
