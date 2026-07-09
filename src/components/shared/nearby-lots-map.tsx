"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import type { ParkingLot } from "@/types/domain";

const NearbyLotsMapInner = dynamic(() => import("@/components/shared/nearby-lots-map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

export function NearbyLotsMap({
  lots,
  activeLotId,
  className,
}: {
  lots: ParkingLot[];
  activeLotId?: string;
  className?: string;
}) {
  return (
    <div className={cn("h-[420px] overflow-hidden rounded-[var(--radius-lg)] border border-border", className)}>
      <NearbyLotsMapInner lots={lots} activeLotId={activeLotId} />
    </div>
  );
}
