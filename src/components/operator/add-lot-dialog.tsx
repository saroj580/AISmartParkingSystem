"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VEHICLE_META, VEHICLE_TYPES } from "@/constants/vehicles";
import type { VehicleType } from "@/types/domain";
import { createParkingLot } from "@/app/operator/lots/actions";

const DEFAULT_RATES: Record<VehicleType, { rate: number; dailyMax: number }> = {
  TWO_WHEELER: { rate: 15, dailyMax: 100 },
  THREE_WHEELER: { rate: 25, dailyMax: 160 },
  FOUR_WHEELER: { rate: 40, dailyMax: 260 },
};

export function AddLotDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    latitude: "",
    longitude: "",
  });
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState(
    () =>
      Object.fromEntries(
        VEHICLE_TYPES.map((t) => [
          t,
          { enabled: true, spaceCount: 10, baseRatePerHour: DEFAULT_RATES[t].rate, dailyMaxRate: DEFAULT_RATES[t].dailyMax },
        ]),
      ) as Record<VehicleType, { enabled: boolean; spaceCount: number; baseRatePerHour: number; dailyMaxRate: number }>,
  );

  function updateVehicleType(type: VehicleType, patch: Partial<(typeof vehicleTypes)[VehicleType]>) {
    setVehicleTypes((v) => ({ ...v, [type]: { ...v[type], ...patch } }));
  }

  async function handleCreate() {
    setSaving(true);
    const result = await createParkingLot({
      ...form,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      vehicleTypes,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      // The address couldn't be located automatically — let the operator pin it manually instead of retyping everything.
      setShowManualCoords(true);
      return;
    }

    toast.success("Parking lot created");
    setOpen(false);
    setForm({ name: "", description: "", addressLine: "", city: "", state: "", postalCode: "", latitude: "", longitude: "" });
    setShowManualCoords(false);
    router.refresh();
  }

  const canSubmit = form.name && form.addressLine && form.city && Object.values(vehicleTypes).some((v) => v.enabled);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add parking lot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a parking lot</DialogTitle>
          <DialogDescription>
            We&apos;ll locate the address on the map and set up zones, spaces, and pricing for you. If we
            can&apos;t find it automatically, you can pin the exact coordinates yourself.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Lot name</Label>
            <Input
              placeholder="Koramangala Central Parking"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Input
              placeholder="24/7 secure covered parking"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Address</Label>
            <Input
              placeholder="80 Koramangala Main Road"
              value={form.addressLine}
              onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>City</Label>
              <Input
                placeholder="Bengaluru"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>State</Label>
              <Input
                placeholder="Karnataka"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>PIN code</Label>
              <Input
                placeholder="560034"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              />
            </div>
          </div>

          {!showManualCoords ? (
            <button
              type="button"
              onClick={() => setShowManualCoords(true)}
              className="w-fit text-xs font-medium text-brand hover:underline"
            >
              Can&apos;t find it on the map? Enter coordinates manually
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-border bg-surface-muted p-3">
              <p className="text-xs text-muted-foreground">
                Look up the address on{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${form.addressLine} ${form.city} ${form.state} India`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand hover:underline"
                >
                  Google Maps
                </a>
                , right-click the pin, and paste the coordinates below.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Latitude</Label>
                  <Input
                    placeholder="12.9758"
                    value={form.latitude}
                    onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Longitude</Label>
                  <Input
                    placeholder="77.6045"
                    value={form.longitude}
                    onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <p className="text-[13px] font-semibold">Zones, spaces & pricing</p>
            {VEHICLE_TYPES.map((type) => {
              const cfg = vehicleTypes[type];
              const meta = VEHICLE_META[type];
              return (
                <div key={type} className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{meta.label}</span>
                    <Switch
                      checked={cfg.enabled}
                      onCheckedChange={(v) => updateVehicleType(type, { enabled: v })}
                    />
                  </div>
                  {cfg.enabled && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs text-muted-foreground">Spaces</Label>
                        <Input
                          type="number"
                          min={1}
                          value={cfg.spaceCount}
                          onChange={(e) => updateVehicleType(type, { spaceCount: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs text-muted-foreground">₹/hr</Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.5"
                          value={cfg.baseRatePerHour}
                          onChange={(e) => updateVehicleType(type, { baseRatePerHour: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs text-muted-foreground">Daily max</Label>
                        <Input
                          type="number"
                          min={0}
                          value={cfg.dailyMaxRate}
                          onChange={(e) => updateVehicleType(type, { dailyMaxRate: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canSubmit || saving}>
            {saving ? "Creating…" : "Create lot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
