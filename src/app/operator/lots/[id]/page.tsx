import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Star, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LotStatusBadge } from "@/components/shared/status-badge";
import { VEHICLE_META, VEHICLE_TYPES, availabilityLevel } from "@/constants/vehicles";
import { PARKING_LOTS, getLot, occupancyPct } from "@/data/lots";
import { cn } from "@/lib/cn";

export function generateStaticParams() {
  return PARKING_LOTS.map((lot) => ({ id: lot.id }));
}

const LEVEL_TEXT = {
  available: "text-available",
  limited: "text-limited",
  full: "text-full",
} as const;

export default async function OperatorLotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lot = getLot(id);
  if (!lot) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link
        href="/operator/lots"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to parking lots
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <LotStatusBadge status={lot.status} />
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-4 fill-limited text-limited" />
              {lot.rating} ({lot.reviewCount})
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            {lot.name}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {lot.addressLine}, {lot.city}, {lot.state} {lot.postalCode}
          </p>
        </div>
        <Button variant="secondary">
          <Pencil className="size-4" />
          Edit lot details
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section>
            <h2 className="text-[15px] font-semibold">Zones & spaces</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {VEHICLE_TYPES.map((type) => {
                const meta = VEHICLE_META[type];
                const Icon = meta.icon;
                const { total, available } = lot.capacity[type];
                const occupied = total - available;
                const level = availabilityLevel(available, total);
                return (
                  <div key={type} className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="size-4 text-muted-foreground" />
                      {meta.label}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-md bg-surface-muted py-2">
                        <p className={cn("text-lg font-semibold", LEVEL_TEXT[level])}>{available}</p>
                        <p className="text-[10px] text-muted-foreground">Available</p>
                      </div>
                      <div className="rounded-md bg-surface-muted py-2">
                        <p className="text-lg font-semibold">{occupied}</p>
                        <p className="text-[10px] text-muted-foreground">Occupied</p>
                      </div>
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      {total} total spaces
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {lot.amenities.map((a) => (
                <Badge key={a} variant="outline">{a}</Badge>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {lot.description}
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
            <p className="text-[13px] font-medium text-muted-foreground">Overall occupancy</p>
            <p className="mt-1 font-display text-3xl font-semibold">{occupancyPct(lot)}%</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand" style={{ width: `${occupancyPct(lot)}%` }} />
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
            <p className="text-[13px] font-semibold">Operating hours</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {lot.openTime === "00:00" && lot.closeTime === "23:59"
                ? "Open 24 hours"
                : `${lot.openTime} – ${lot.closeTime}`}
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
            <p className="text-[13px] font-semibold">Pricing</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {VEHICLE_TYPES.map((type) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{VEHICLE_META[type].label}</span>
                  <span className="font-medium">${lot.pricing[type].baseRatePerHour.toFixed(2)}/hr</span>
                </div>
              ))}
            </div>
            <Link
              href="/operator/pricing"
              className="mt-3 inline-block text-xs font-medium text-brand hover:underline"
            >
              Manage pricing rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
