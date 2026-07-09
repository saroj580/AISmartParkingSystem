import { VEHICLE_META } from "@/constants/vehicles";
import type { ParkingLot, Vehicle, VehicleType } from "@/types/domain";

export function BookingSummary({
  lot,
  vehicleType,
  vehicle,
  date,
  startHour,
  duration,
}: {
  lot: ParkingLot;
  vehicleType: VehicleType | null;
  vehicle: Vehicle | null;
  date: Date | null;
  startHour: number | null;
  duration: number | null;
}) {
  const rate = vehicleType ? lot.pricing[vehicleType].baseRatePerHour : 0;
  const dailyMax = vehicleType ? lot.pricing[vehicleType].dailyMaxRate : 0;
  const rawTotal = duration ? rate * duration : 0;
  const cappedTotal = duration
    ? Math.min(rawTotal, dailyMax * Math.ceil(duration / 24))
    : 0;
  const serviceFee = cappedTotal > 0 ? Math.max(0.5, cappedTotal * 0.05) : 0;
  const total = cappedTotal + serviceFee;

  const endHour = startHour !== null && duration !== null ? startHour + duration : null;

  return (
    <div className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-border bg-card p-5">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Summary
        </p>
        <p className="mt-1 text-[15px] font-semibold">{lot.name}</p>
        <p className="text-xs text-muted-foreground">
          {lot.addressLine}, {lot.city}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-4 text-sm">
        <Row
          label="Vehicle type"
          value={vehicleType ? VEHICLE_META[vehicleType].label : "—"}
        />
        <Row
          label="Vehicle"
          value={vehicle ? `${vehicle.make} ${vehicle.model}` : "—"}
        />
        <Row
          label="Date"
          value={
            date
              ? date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "—"
          }
        />
        <Row
          label="Time window"
          value={
            startHour !== null && endHour !== null
              ? `${formatHour(startHour)} – ${formatHour(endHour % 24)}`
              : "—"
          }
        />
        <Row label="Duration" value={duration ? `${duration}h` : "—"} />
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <Row label={`Rate (${rate.toFixed(2)}/hr)`} value={`$${rawTotal.toFixed(2)}`} muted />
        <Row label="Service fee" value={`$${serviceFee.toFixed(2)}`} muted />
        <div className="flex items-center justify-between border-t border-border pt-2.5">
          <span className="font-semibold">Total</span>
          <span className="font-display text-lg font-semibold">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

function formatHour(h: number) {
  if (h === 0) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
}

export function computeTotal(
  lot: ParkingLot,
  vehicleType: VehicleType | null,
  duration: number | null,
) {
  if (!vehicleType || !duration) return 0;
  const rate = lot.pricing[vehicleType].baseRatePerHour;
  const dailyMax = lot.pricing[vehicleType].dailyMaxRate;
  const rawTotal = rate * duration;
  const cappedTotal = Math.min(rawTotal, dailyMax * Math.ceil(duration / 24));
  const serviceFee = cappedTotal > 0 ? Math.max(0.5, cappedTotal * 0.05) : 0;
  return cappedTotal + serviceFee;
}
