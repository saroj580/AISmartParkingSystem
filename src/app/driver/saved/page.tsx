import { Bookmark } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function SavedParkingPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Saved parking"
        description="Lots you've bookmarked for quick access."
      />

      <EmptyState
        icon={<Bookmark />}
        title="No saved lots yet"
        description="Bookmark a parking lot from its details page to see it here."
      />
    </div>
  );
}
