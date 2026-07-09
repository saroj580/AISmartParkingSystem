import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listDriverBookings } from "@/server/views/bookings";
import { BookingsListClient } from "@/components/driver/bookings-list-client";

export default async function BookingsPage() {
  const session = await getSessionUser();
  const driverProfile = await prisma.driverProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const bookings = await listDriverBookings(driverProfile.id);

  return <BookingsListClient bookings={bookings} />;
}
