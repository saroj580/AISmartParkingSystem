import { VEHICLE_META } from "@/constants/vehicles";
import type { VehicleType } from "@/types/domain";
import { cn } from "@/lib/cn";

export function VehicleTypeBadge({
  type,
  className,
  showIcon = true,
}: {
  type: VehicleType;
  className?: string;
  showIcon?: boolean;
}) {
  const meta = VEHICLE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground",
        className,
      )}
    >
      {showIcon && <Icon className="size-3.5 text-muted-foreground" />}
      {meta.label}
    </span>
  );
}
