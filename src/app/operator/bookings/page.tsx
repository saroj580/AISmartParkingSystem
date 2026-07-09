import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listOperatorBookings } from "@/server/views/bookings";
import { listLotsForOperator } from "@/server/views/parking-lots";
import { BookingsClient } from "@/components/operator/bookings-client";

export default async function OperatorBookingsPage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const [bookings, lots] = await Promise.all([
    listOperatorBookings(operatorProfile.id),
    listLotsForOperator(operatorProfile.id),
  ]);

  return <BookingsClient bookings={bookings} lots={lots.map((l) => ({ id: l.id, name: l.name }))} />;
}
