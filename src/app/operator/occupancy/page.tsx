"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { operatorSpaces } from "@/data/spaces";
import { operatorLots } from "@/data/lots";
import { CURRENT_OPERATOR } from "@/data/user";
import { cn } from "@/lib/cn";

const STATUS_STYLES = {
  AVAILABLE: "bg-available/70",
  RESERVED: "bg-brand/70",
  OCCUPIED: "bg-full/70",
  MAINTENANCE: "bg-limited/70",
} as const;

export default function LiveOccupancyPage() {
  const lots = operatorLots(CURRENT_OPERATOR.id);
  const [lotId, setLotId] = useState(lots[0]?.id ?? "");
  const allSpaces = useMemo(() => operatorSpaces(CURRENT_OPERATOR.id), []);

  const spaces = allSpaces.filter((s) => s.lotId === lotId);
  const zones = Array.from(new Set(spaces.map((s) => s.zoneName)));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Live occupancy"
        description="Updated in real time as vehicles check in and out."
        actions={
          <Badge variant="available" dot>
            Live
          </Badge>
        }
      />

      <Tabs value={lotId} onValueChange={setLotId}>
        <TabsList>
          {lots.map((l) => (
            <TabsTrigger key={l.id} value={l.id}>{l.name}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {Object.entries({
          Available: "AVAILABLE",
          Reserved: "RESERVED",
          Occupied: "OCCUPIED",
          Maintenance: "MAINTENANCE",
        } as const).map(([label, key]) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-[3px]", STATUS_STYLES[key])} />
            {label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {zones.map((zone) => {
          const zoneSpaces = spaces.filter((s) => s.zoneName === zone);
          return (
            <div key={zone} className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-semibold">{zone}</p>
                <p className="text-xs text-muted-foreground">
                  {zoneSpaces.filter((s) => s.status === "AVAILABLE").length}/{zoneSpaces.length} available
                </p>
              </div>
              <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
                {zoneSpaces.map((s) => (
                  <div
                    key={s.id}
                    title={`${s.code} · ${s.status}`}
                    className={cn(
                      "aspect-square rounded-[4px] transition-transform hover:scale-110",
                      STATUS_STYLES[s.status],
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
