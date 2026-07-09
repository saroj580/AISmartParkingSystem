import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/driver/booking/booking-wizard";
import { getParkingLotDetail } from "@/server/views/parking-lots";
import { listDriverVehicles } from "@/server/views/vehicles";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function BookLotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lot = await getParkingLotDetail(id);
  if (!lot) notFound();

  const session = await getSessionUser();
  const driverProfile = await prisma.driverProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const vehicles = await listDriverVehicles(driverProfile.id);

  return (
    <div className="mx-auto max-w-6xl">
      <BookingWizard lot={lot} vehicles={vehicles} />
    </div>
  );
}
