import Link from "next/link";
import { Star, MapPin, Bookmark } from "lucide-react";
import type { ParkingLot } from "@/types/domain";
import { AvailabilityRow } from "@/components/shared/availability-row";
import { LotStatusBadge } from "@/components/shared/status-badge";
import { lowestHourlyRate } from "@/data/lots";
import { cn } from "@/lib/cn";

export function ParkingLotCard({
  lot,
  saved = false,
  className,
}: {
  lot: ParkingLot;
  saved?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/driver/parking/${lot.id}`}
      className={cn(
        "group block overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div
        className="relative flex h-28 items-end p-4"
        style={{
          background: `linear-gradient(135deg, ${lot.coverColor}22, ${lot.coverColor}05)`,
        }}
      >
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {saved && (
            <span className="flex size-7 items-center justify-center rounded-full bg-surface/90 text-brand shadow-xs">
              <Bookmark className="size-3.5 fill-current" />
            </span>
          )}
          <LotStatusBadge status={lot.status} />
        </div>
        <div>
          <p className="font-display text-[15px] font-semibold leading-tight">
            {lot.name}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {lot.city} · {lot.distanceKm} km away
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <AvailabilityRow capacity={lot.capacity} compact />

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-limited text-limited" />
            <span className="font-medium text-foreground">{lot.rating}</span>
            <span>({lot.reviewCount})</span>
          </div>
          <p className="text-sm">
            <span className="font-semibold">
              ${lowestHourlyRate(lot).toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">/hr from</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
