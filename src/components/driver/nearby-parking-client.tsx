"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, List, Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParkingLotCard } from "@/components/driver/parking-lot-card";
import { EmptyState } from "@/components/shared/empty-state";
import { NearbyLotsMap } from "@/components/shared/nearby-lots-map";
import { VEHICLE_META, VEHICLE_TYPES } from "@/constants/vehicles";
import type { ParkingLot, VehicleType } from "@/types/domain";
import { cn } from "@/lib/cn";

type SortKey = "distance" | "price" | "rating";
type ViewMode = "list" | "map";

export function NearbyParkingClient({
  lots,
  savedLotIds = [],
}: {
  lots: ParkingLot[];
  savedLotIds?: string[];
}) {
  const [query, setQuery] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("distance");
  const [view, setView] = useState<ViewMode>("list");

  const results = useMemo(() => {
    let filtered = lots.filter((lot) =>
      `${lot.name} ${lot.city} ${lot.addressLine}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    if (vehicleType !== "ALL") {
      filtered = filtered.filter((lot) => lot.capacity[vehicleType].total > 0);
    }
    return [...filtered].sort((a, b) => {
      if (sort === "distance") return a.distanceKm - b.distanceKm;
      if (sort === "rating") return b.rating - a.rating;
      const rateA = vehicleType === "ALL" ? a.pricing.FOUR_WHEELER.baseRatePerHour : a.pricing[vehicleType].baseRatePerHour;
      const rateB = vehicleType === "ALL" ? b.pricing.FOUR_WHEELER.baseRatePerHour : b.pricing[vehicleType].baseRatePerHour;
      return rateA - rateB;
    });
  }, [lots, query, vehicleType, sort]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Nearby parking"
        description={`${results.length} lots found`}
        actions={
          <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-border p-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors",
                view === "list" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <List className="size-3.5" />
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors",
                view === "map" ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <MapIcon className="size-3.5" />
              Map
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            leadingIcon={<Search />}
            placeholder="Search by name or address…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-2 overflow-x-auto">
            <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
            {(["distance", "price", "rating"] as SortKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={cn(
                  "shrink-0 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  sort === key
                    ? "border-brand bg-brand-subtle text-brand-subtle-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setVehicleType("ALL")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              vehicleType === "ALL"
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            All vehicles
          </button>
          {VEHICLE_TYPES.map((type) => {
            const meta = VEHICLE_META[type];
            const Icon = meta.icon;
            return (
              <button
                key={type}
                onClick={() => setVehicleType(type)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  vehicleType === type
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-3.5" />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="No parking lots found"
          description="Try a different search term or clear your filters."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery("");
                setVehicleType("ALL");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : view === "map" ? (
        <NearbyLotsMap lots={results} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((lot) => (
            <ParkingLotCard
              key={lot.id}
              lot={lot}
              saved={savedLotIds.includes(lot.id)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <Badge variant="neutral" size="sm">
          Showing all matching results
        </Badge>
      </div>
    </div>
  );
}
