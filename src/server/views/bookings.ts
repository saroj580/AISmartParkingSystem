import type {
  Booking as PrismaBooking,
  ParkingLot as PrismaParkingLot,
  ParkingSpace as PrismaParkingSpace,
  ParkingZone as PrismaParkingZone,
  Vehicle as PrismaVehicle,
  QrCode as PrismaQrCode,
  DriverProfile as PrismaDriverProfile,
  User as PrismaUser,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Booking } from "@/types/domain";

type BookingRow = PrismaBooking & {
  lot: PrismaParkingLot;
  space: PrismaParkingSpace & { zone: PrismaParkingZone };
  vehicle: PrismaVehicle;
  qrCode: PrismaQrCode | null;
  driver?: PrismaDriverProfile & { user: PrismaUser };
};

const bookingInclude = {
  lot: true,
  space: { include: { zone: true } },
  vehicle: true,
  qrCode: true,
} as const;

function toBookingVM(b: BookingRow): Booking {
  return {
    id: b.id,
    bookingNumber: b.bookingNumber,
    lotId: b.lotId,
    lotName: b.lot.name,
    lotAddress: b.lot.addressLine,
    lotCity: b.lot.city,
    spaceCode: b.space.code,
    zoneName: b.space.zone.name,
    vehicleType: b.vehicle.type,
    vehiclePlate: b.vehicle.plateNumber,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    actualCheckInAt: b.actualCheckInAt?.toISOString() ?? null,
    actualCheckOutAt: b.actualCheckOutAt?.toISOString() ?? null,
    status: b.status,
    totalAmount: Number(b.totalAmount),
    currency: b.currency,
    createdAt: b.createdAt.toISOString(),
    qrStatus: b.qrCode?.status ?? "INVALID",
    qrToken: b.qrCode?.code ?? "",
    driverName: b.driver ? `${b.driver.user.firstName} ${b.driver.user.lastName}` : undefined,
    driverEmail: b.driver?.user.email,
  };
}

export async function listDriverBookings(driverId: string): Promise<Booking[]> {
  const rows = await prisma.booking.findMany({
    where: { driverId },
    orderBy: { createdAt: "desc" },
    include: bookingInclude,
  });
  return rows.map(toBookingVM);
}

export async function getDriverBooking(driverId: string, id: string): Promise<Booking | null> {
  const row = await prisma.booking.findFirst({
    where: { id, driverId },
    include: bookingInclude,
  });
  return row ? toBookingVM(row) : null;
}

export async function getDriverActiveAndUpcoming(driverId: string) {
  const [active, upcoming] = await Promise.all([
    prisma.booking.findFirst({
      where: { driverId, status: "ACTIVE" },
      orderBy: { actualCheckInAt: "desc" },
      include: bookingInclude,
    }),
    prisma.booking.findFirst({
      where: { driverId, status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: { startTime: "asc" },
      include: bookingInclude,
    }),
  ]);

  return {
    active: active ? toBookingVM(active) : null,
    upcoming: upcoming ? toBookingVM(upcoming) : null,
  };
}

export async function listOperatorBookings(operatorId: string): Promise<Booking[]> {
  const rows = await prisma.booking.findMany({
    where: { lot: { operatorId } },
    orderBy: { createdAt: "desc" },
    include: { ...bookingInclude, driver: { include: { user: true } } },
  });
  return rows.map(toBookingVM);
}
