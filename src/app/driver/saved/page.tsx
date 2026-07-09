import { Bookmark } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ParkingLotCard } from "@/components/driver/parking-lot-card";
import { PARKING_LOTS } from "@/data/lots";
import { CURRENT_DRIVER } from "@/data/user";

export default function SavedParkingPage() {
  const saved = PARKING_LOTS.filter((l) => CURRENT_DRIVER.savedLots.includes(l.id));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Saved parking"
        description="Lots you've bookmarked for quick access."
      />

      {saved.length === 0 ? (
        <EmptyState
          icon={<Bookmark />}
          title="No saved lots yet"
          description="Bookmark a parking lot from its details page to see it here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((lot) => (
            <ParkingLotCard key={lot.id} lot={lot} saved />
          ))}
        </div>
      )}
    </div>
  );
}
