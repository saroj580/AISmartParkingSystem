import { listActiveParkingLots } from "@/server/views/parking-lots";
import { NearbyParkingClient } from "@/components/driver/nearby-parking-client";

export default async function NearbyParkingPage() {
  const lots = await listActiveParkingLots();
  return <NearbyParkingClient lots={lots} />;
}
