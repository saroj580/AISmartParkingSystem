import { VEHICLE_META, VEHICLE_TYPES } from "@/constants/vehicles";
import type { ParkingLot, Vehicle, VehicleType } from "@/types/domain";
import { cn } from "@/lib/cn";

export function VehicleStep({
  lot,
  vehicles,
  vehicleType,
  vehicleId,
  onSelectType,
  onSelectVehicle,
}: {
  lot: ParkingLot;
  vehicles: Vehicle[];
  vehicleType: VehicleType | null;
  vehicleId: string | null;
  onSelectType: (t: VehicleType) => void;
  onSelectVehicle: (id: string) => void;
}) {
  const matchingVehicles = vehicles.filter(
    (v) => v.type === vehicleType && v.isActive,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold">Select vehicle type</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Availability and rates at {lot.name} vary by vehicle type.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {VEHICLE_TYPES.map((type) => {
            const meta = VEHICLE_META[type];
            const Icon = meta.icon;
            const { available, total } = lot.capacity[type];
            const disabled = total === 0 || available === 0;
            const active = vehicleType === type;
            return (
              <button
                key={type}
                disabled={disabled}
                onClick={() => onSelectType(type)}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  active
                    ? "border-brand bg-brand-subtle shadow-[var(--shadow-glow)]"
                    : "border-border bg-card hover:border-border-strong",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[var(--radius-sm)]",
                    active ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {disabled ? "Unavailable" : `${available} spaces free`}
                  </p>
                </div>
                <p className="text-sm font-semibold text-brand">
                  ${lot.pricing[type].baseRatePerHour.toFixed(2)}/hr
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {vehicleType && (
        <div>
          <h2 className="text-[15px] font-semibold">Select your vehicle</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose which {VEHICLE_META[vehicleType].label.toLowerCase()} you’re bringing.
          </p>
          {matchingVehicles.length === 0 ? (
            <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              You don’t have a {VEHICLE_META[vehicleType].label.toLowerCase()} saved yet.
              Add one from Vehicles to continue.
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {matchingVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onSelectVehicle(v.id)}
                  className={cn(
                    "flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors",
                    vehicleId === v.id
                      ? "border-brand bg-brand-subtle"
                      : "border-border bg-card hover:border-border-strong",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {v.make} {v.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {v.plateNumber} · {v.color}
                    </p>
                  </div>
                  {v.isDefault && (
                    <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
