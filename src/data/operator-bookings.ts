import type { Booking, VehicleType } from "@/types/domain";
import { CUSTOMERS } from "@/data/customers";

const now = Date.now();
const H = 3600_000;
const D = 24 * H;
function iso(offsetMs: number) {
  return new Date(now + offsetMs).toISOString();
}

const LOTS = [
  { id: "lot_marina", name: "Marina Bay SmartDeck" },
  { id: "lot_union", name: "Union Square Central" },
  { id: "lot_pier", name: "Embarcadero Pier 3" },
];

const VEHICLE_TYPES: VehicleType[] = ["FOUR_WHEELER", "TWO_WHEELER", "THREE_WHEELER"];
const STATUSES: Booking["status"][] = [
  "COMPLETED", "COMPLETED", "COMPLETED", "ACTIVE", "CONFIRMED", "CANCELLED", "NO_SHOW",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generate(): Booking[] {
  const rand = seededRandom(42);
  const bookings: Booking[] = [];

  for (let i = 0; i < 32; i++) {
    const lot = LOTS[Math.floor(rand() * LOTS.length)]!;
    const customer = CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)]!;
    const vehicleType = VEHICLE_TYPES[Math.floor(rand() * VEHICLE_TYPES.length)]!;
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]!;
    const dayOffset = -Math.floor(rand() * 20) * D;
    const hourOffset = Math.floor(rand() * 20) * H;
    const durationH = 1 + Math.floor(rand() * 6);
    const rate = vehicleType === "FOUR_WHEELER" ? 80 : vehicleType === "TWO_WHEELER" ? 30 : 50;
    const amount = Math.round(rate * durationH * 100) / 100;

    bookings.push({
      id: `obk_${i}`,
      bookingNumber: `PK-${(100000 + i * 137).toString(36).toUpperCase()}`,
      lotId: lot.id,
      lotName: lot.name,
      lotAddress: "",
      lotCity: "San Francisco",
      spaceCode: `${String.fromCharCode(65 + (i % 4))}-${10 + (i % 40)}`,
      zoneName: `Zone ${String.fromCharCode(65 + (i % 4))}`,
      vehicleType,
      vehiclePlate: `${customer.name.slice(0, 3).toUpperCase()}${100 + i}`,
      startTime: iso(dayOffset + hourOffset),
      endTime: iso(dayOffset + hourOffset + durationH * H),
      actualCheckInAt: status === "COMPLETED" || status === "ACTIVE" ? iso(dayOffset + hourOffset) : null,
      actualCheckOutAt: status === "COMPLETED" ? iso(dayOffset + hourOffset + durationH * H) : null,
      status,
      totalAmount: amount,
      currency: "INR",
      createdAt: iso(dayOffset + hourOffset - H),
      qrStatus: status === "COMPLETED" ? "USED" : status === "ACTIVE" ? "CHECKED_IN" : status === "CANCELLED" || status === "NO_SHOW" ? "INVALID" : "ACTIVE",
      qrToken: `QR-${i}`,
      driverName: customer.name,
      driverEmail: customer.email,
    });
  }

  return bookings.sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );
}

export const OPERATOR_BOOKINGS: Booking[] = generate();

export function operatorRevenueTotal() {
  return OPERATOR_BOOKINGS.filter((b) => b.status === "COMPLETED" || b.status === "ACTIVE").reduce(
    (sum, b) => sum + b.totalAmount,
    0,
  );
}