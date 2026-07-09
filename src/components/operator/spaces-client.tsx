"use client";

import { useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { OperatorSpaceRow } from "@/server/views/spaces";
import type { SpaceStatus } from "@/types/domain";

const STATUS_VARIANT: Record<SpaceStatus, "available" | "brand" | "full" | "limited"> = {
  AVAILABLE: "available",
  RESERVED: "brand",
  OCCUPIED: "full",
  MAINTENANCE: "limited",
};

export function SpacesClient({
  spaces,
  lots,
}: {
  spaces: OperatorSpaceRow[];
  lots: { id: string; name: string }[];
}) {
  const [lotFilter, setLotFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = spaces.filter((s) => {
    if (lotFilter !== "ALL" && s.lotId !== lotFilter) return false;
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    total: spaces.length,
    available: spaces.filter((s) => s.status === "AVAILABLE").length,
    occupied: spaces.filter((s) => s.status === "OCCUPIED").length,
    maintenance: spaces.filter((s) => s.status === "MAINTENANCE").length,
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatChip label="Total" value={counts.total} />
        <StatChip label="Available" value={counts.available} tone="available" />
        <StatChip label="Occupied" value={counts.occupied} tone="full" />
        <StatChip label="Maintenance" value={counts.maintenance} tone="limited" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={lotFilter} onValueChange={setLotFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All lots</SelectItem>
            {lots.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="OCCUPIED">Occupied</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Space</TableHead>
            <TableHead>Lot</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Vehicle type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.slice(0, 60).map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-xs font-medium">{s.code}</TableCell>
              <TableCell className="text-muted-foreground">{s.lotName}</TableCell>
              <TableCell className="text-muted-foreground">{s.zoneName}</TableCell>
              <TableCell><VehicleTypeBadge type={s.vehicleType} /></TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[s.status]} dot size="sm">
                  {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filtered.length > 60 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing 60 of {filtered.length} spaces
        </p>
      )}
    </>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "available" | "full" | "limited";
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={
          "mt-1 font-display text-2xl font-semibold " +
          (tone === "available" ? "text-available" : tone === "full" ? "text-full" : tone === "limited" ? "text-limited" : "")
        }
      >
        {value}
      </p>
    </div>
  );
}
