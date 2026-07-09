import Link from "next/link";
import { MapPin, Star, Clock, PencilLine } from "lucide-react";
import type { ParkingLot } from "@/types/domain";

export function LotStep({ lot }: { lot: ParkingLot }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[15px] font-semibold">Confirm parking lot</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You’re reserving a space at this location.
        </p>
      </div>

      <div
        className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-border p-5"
        style={{
          background: `linear-gradient(135deg, ${lot.coverColor}18, transparent)`,
        }}
      >
        <div>
          <p className="font-display text-lg font-semibold">{lot.name}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {lot.addressLine}, {lot.city}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1 font-medium">
              <Star className="size-4 fill-limited text-limited" />
              {lot.rating}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="size-4" />
              {lot.openTime === "00:00" && lot.closeTime === "23:59"
                ? "Open 24 hours"
                : `${lot.openTime} – ${lot.closeTime}`}
            </span>
          </div>
        </div>
        <Link
          href={`/driver/parking/${lot.id}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          <PencilLine className="size-3.5" />
          Change
        </Link>
      </div>
    </div>
  );
}
