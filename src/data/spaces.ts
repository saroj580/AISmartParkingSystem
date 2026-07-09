import type { SpaceStatus, VehicleType } from "@/types/domain";
import { operatorLots } from "@/data/lots";
import { VEHICLE_TYPES } from "@/constants/vehicles";

export interface ParkingSpaceRow {
  id: string;
  lotId: string;
  lotName: string;
  zoneName: string;
  code: string;
  vehicleType: VehicleType;
  status: SpaceStatus;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSpaces(operatorId: string): ParkingSpaceRow[] {
  const lots = operatorLots(operatorId);
  const rand = seededRandom(7);
  const rows: ParkingSpaceRow[] = [];

  for (const lot of lots) {
    for (const type of VEHICLE_TYPES) {
      const { total, available } = lot.capacity[type];
      const cap = Math.min(total, 24);
      const availableRatio = total > 0 ? available / total : 0;
      const zonePrefix = type === "FOUR_WHEELER" ? "D" : type === "TWO_WHEELER" ? "B" : "C";

      for (let i = 0; i < cap; i++) {
        const r = rand();
        let status: SpaceStatus = "AVAILABLE";
        if (r > availableRatio) {
          status = r > 0.94 ? "MAINTENANCE" : r > availableRatio + (1 - availableRatio) * 0.5 ? "OCCUPIED" : "RESERVED";
        }
        rows.push({
          id: `${lot.id}_${type}_${i}`,
          lotId: lot.id,
          lotName: lot.name,
          zoneName: `Zone ${zonePrefix}`,
          code: `${zonePrefix}-${String(i + 1).padStart(2, "0")}`,
          vehicleType: type,
          status,
        });
      }
    }
  }

  return rows;
}

export function operatorSpaces(operatorId: string) {
  return generateSpaces(operatorId);
}
