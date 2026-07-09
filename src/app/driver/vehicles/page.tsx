"use client";

import { useState } from "react";
import { Plus, MoreVertical, Star, Trash2, Pencil } from "lucide-react";
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
import { DRIVER_VEHICLES } from "@/data/user";
import { toast } from "sonner";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(DRIVER_VEHICLES);
  const [open, setOpen] = useState(false);

  function removeVehicle(id: string) {
    setVehicles((v) => v.filter((x) => x.id !== id));
    toast.success("Vehicle removed");
  }

  function setDefault(id: string) {
    setVehicles((v) => v.map((x) => ({ ...x, isDefault: x.id === id })));
    toast.success("Default vehicle updated");
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
                  <Select defaultValue="FOUR_WHEELER">
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
                    <Input placeholder="Toyota" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Model</Label>
                    <Input placeholder="Camry" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Plate number</Label>
                    <Input placeholder="8XYZ204" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Color</Label>
                    <Input placeholder="Midnight Silver" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setOpen(false);
                    toast.success("Vehicle added");
                  }}
                >
                  Save vehicle
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
                    <DropdownMenuItem>
                      <Pencil className="size-4" />
                      Edit details
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
