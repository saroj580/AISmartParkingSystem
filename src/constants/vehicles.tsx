import { Bike, Car, Truck } from "lucide-react";
import type { VehicleType } from "@/types/domain";

export const VEHICLE_META: Record<
  VehicleType,
  { label: string; short: string; icon: typeof Car; description: string }
> = {
  TWO_WHEELER: {
    label: "Two Wheeler",
    short: "2W",
    icon: Bike,
    description: "Motorcycles, scooters & bikes",
  },
  THREE_WHEELER: {
    label: "Three Wheeler",
    short: "3W",
    icon: Truck,
    description: "Auto-rickshaws & tuk-tuks",
  },
  FOUR_WHEELER: {
    label: "Four Wheeler",
    short: "4W",
    icon: Car,
    description: "Cars, SUVs & vans",
  },
};

export const VEHICLE_TYPES: VehicleType[] = [
  "TWO_WHEELER",
  "THREE_WHEELER",
  "FOUR_WHEELER",
];

export function availabilityLevel(available: number, total: number) {
  if (total === 0 || available === 0) return "full" as const;
  const ratio = available / total;
  if (ratio <= 0.2) return "limited" as const;
  return "available" as const;
}
