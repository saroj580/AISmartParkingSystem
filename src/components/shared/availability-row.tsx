import { VEHICLE_META, VEHICLE_TYPES, availabilityLevel } from "@/constants/vehicles";
import type { Capacity } from "@/types/domain";
import { cn } from "@/lib/cn";

const LEVEL_STYLES = {
  available: "bg-available",
  limited: "bg-limited",
  full: "bg-full",
} as const;

const LEVEL_TEXT = {
  available: "text-available",
  limited: "text-limited",
  full: "text-full",
} as const;

export function AvailabilityRow({
  capacity,
  compact = false,
}: {
  capacity: Capacity;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", compact ? "gap-1.5" : "gap-2")}>
      {VEHICLE_TYPES.map((type) => {
        const { total, available } = capacity[type];
        const level = availabilityLevel(available, total);
        const Icon = VEHICLE_META[type].icon;
        const pct = total === 0 ? 0 : (available / total) * 100;
        return (
          <div
            key={type}
            className="flex flex-col gap-1.5 rounded-[var(--radius-sm)] border border-border bg-surface-muted px-2.5 py-2"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Icon className="size-3.5" />
              {VEHICLE_META[type].short}
            </div>
            <div className={cn("text-sm font-semibold tabular-nums", LEVEL_TEXT[level])}>
              {available}
              <span className="text-muted-foreground font-normal">/{total}</span>
            </div>
            {!compact && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={cn("h-full rounded-full", LEVEL_STYLES[level])}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
