"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

// Leaflet touches `window` at import time, so it can only load client-side.
const LotMapInner = dynamic(() => import("@/components/shared/lot-map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

export function LotMap({
  latitude,
  longitude,
  name,
  address,
  className,
}: {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-56 overflow-hidden rounded-[var(--radius-lg)] border border-border",
        className,
      )}
    >
      <LotMapInner
        latitude={latitude}
        longitude={longitude}
        name={name}
        address={address}
      />
    </div>
  );
}