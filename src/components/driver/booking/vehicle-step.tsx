"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { VEHICLE_META, VEHICLE_TYPES } from "@/constants/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ParkingLot, Vehicle, VehicleType } from "@/types/domain";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

export function VehicleStep({
  lot,
  vehicles,
  vehicleType,
  vehicleId,
  onSelectType,
  onSelectVehicle,
  onVehicleAdded,
}: {
  lot: ParkingLot;
  vehicles: Vehicle[];
  vehicleType: VehicleType | null;
  vehicleId: string | null;
  onSelectType: (t: VehicleType) => void;
  onSelectVehicle: (id: string) => void;
  onVehicleAdded: (vehicle: Vehicle) => void;
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
                  {formatCurrency(lot.pricing[type].baseRatePerHour)}/hr
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
          {matchingVehicles.length > 0 && (
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
          <AddVehicleInline
            vehicleType={vehicleType}
            hasNoVehiclesOfType={matchingVehicles.length === 0}
            isFirstVehicle={vehicles.length === 0}
            onVehicleAdded={(vehicle) => {
              onVehicleAdded(vehicle);
              onSelectVehicle(vehicle.id);
            }}
          />
        </div>
      )}
    </div>
  );
}

function AddVehicleInline({
  vehicleType,
  hasNoVehiclesOfType,
  isFirstVehicle,
  onVehicleAdded,
}: {
  vehicleType: VehicleType;
  hasNoVehiclesOfType: boolean;
  isFirstVehicle: boolean;
  onVehicleAdded: (vehicle: Vehicle) => void;
}) {
  const [open, setOpen] = useState(hasNoVehiclesOfType);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ plateNumber: "", make: "", model: "", color: "" });

  async function handleAdd() {
    setSaving(true);
    const res = await fetch("/api/v1/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type: vehicleType, isDefault: isFirstVehicle }),
    });
    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok || !json?.success) {
      toast.error(json?.error?.message ?? "Couldn't add vehicle");
      return;
    }

    toast.success("Vehicle added");
    onVehicleAdded({
      id: json.data.id,
      plateNumber: json.data.plateNumber,
      type: json.data.type,
      make: json.data.make ?? "",
      model: json.data.model ?? "",
      color: json.data.color ?? "",
      isDefault: json.data.isDefault,
      isActive: json.data.isActive,
    });
    setForm({ plateNumber: "", make: "", model: "", color: "" });
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <Plus className="size-4" />
        Add a different vehicle
      </button>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-dashed border-border p-4">
      {hasNoVehiclesOfType && (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have a saved vehicle for this type yet — add one below to continue.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Plate number</Label>
          <Input
            placeholder="MH12AB1234"
            value={form.plateNumber}
            onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Color</Label>
          <Input
            placeholder="White"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Make</Label>
          <Input
            placeholder="Honda"
            value={form.make}
            onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Model</Label>
          <Input
            placeholder="Activa"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleAdd} disabled={saving || !form.plateNumber}>
          {saving ? "Adding…" : "Add vehicle"}
        </Button>
        {!hasNoVehiclesOfType && (
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
