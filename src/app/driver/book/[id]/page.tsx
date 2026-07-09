import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/driver/booking/booking-wizard";
import { PARKING_LOTS, getLot } from "@/data/lots";
import { DRIVER_VEHICLES } from "@/data/user";

export function generateStaticParams() {
  return PARKING_LOTS.map((lot) => ({ id: lot.id }));
}

export default async function BookLotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lot = getLot(id);
  if (!lot) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <BookingWizard lot={lot} vehicles={DRIVER_VEHICLES} />
    </div>
  );
}
