"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VEHICLE_META, VEHICLE_TYPES } from "@/constants/vehicles";
import type { Vehicle, VehicleType } from "@/types/domain";
import { toast } from "sonner";

export function VehiclesClient({ vehicles: initialVehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "FOUR_WHEELER" as VehicleType,
    make: "",
    model: "",
    plateNumber: "",
    color: "",
  });

  async function removeVehicle(id: string) {
    const res = await fetch(`/api/v1/vehicles/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message ?? "Couldn't remove vehicle");
      return;
    }
    setVehicles((v) => v.filter((x) => x.id !== id));
    toast.success("Vehicle removed");
    router.refresh();
  }

  async function setDefault(id: string) {
    const res = await fetch(`/api/v1/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message ?? "Couldn't update default vehicle");
      return;
    }
    setVehicles((v) => v.map((x) => ({ ...x, isDefault: x.id === id })));
    toast.success("Default vehicle updated");
    router.refresh();
  }

  async function addVehicle() {
    setSaving(true);
    const res = await fetch("/api/v1/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok || !json?.success) {
      toast.error(json?.error?.message ?? "Couldn't add vehicle");
      return;
    }

    setVehicles((v) => [
      {
        id: json.data.id,
        plateNumber: json.data.plateNumber,
        type: json.data.type,
        make: json.data.make ?? "",
        model: json.data.model ?? "",
        color: json.data.color ?? "",
        isDefault: json.data.isDefault,
        isActive: json.data.isActive,
      },
      ...v,
    ]);
    setOpen(false);
    setForm({ type: "FOUR_WHEELER", make: "", model: "", plateNumber: "", color: "" });
    toast.success("Vehicle added");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Vehicles"
        description="Manage the vehicles you park with HamroPark."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" />
                Add vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a vehicle</DialogTitle>
                <DialogDescription>
                  Save vehicle details for faster booking next time.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Vehicle type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((f) => ({ ...f, type: v as VehicleType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {VEHICLE_META[t].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Make</Label>
                    <Input
                      placeholder="Toyota"
                      value={form.make}
                      onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Model</Label>
                    <Input
                      placeholder="Camry"
                      value={form.model}
                      onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Plate number</Label>
                    <Input
                      placeholder="8XYZ204"
                      value={form.plateNumber}
                      onChange={(e) => setForm((f) => ({ ...f, plateNumber: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Color</Label>
                    <Input
                      placeholder="Midnight Silver"
                      value={form.color}
                      onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addVehicle} disabled={saving || !form.plateNumber}>
                  {saving ? "Saving…" : "Save vehicle"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {vehicles.map((v) => {
          const meta = VEHICLE_META[v.type];
          const Icon = meta.icon;
          return (
            <div
              key={v.id}
              className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-subtle text-brand-subtle-foreground">
                  <Icon className="size-5" />
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setDefault(v.id)}>
                      <Star className="size-4" />
                      Set as default
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => removeVehicle(v.id)}
                      className="text-full focus:bg-full-subtle focus:text-full"
                    >
                      <Trash2 className="size-4" />
                      Remove vehicle
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold">
                    {v.make} {v.model}
                  </p>
                  {v.isDefault && <Badge variant="brand" size="sm">Default</Badge>}
                  {!v.isActive && <Badge variant="neutral" size="sm">Inactive</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta.label} · {v.color}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-md bg-surface-muted px-3 py-2">
                <span className="text-xs text-muted-foreground">Plate</span>
                <span className="font-mono text-sm font-semibold">
                  {v.plateNumber}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
