import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LotStatusBadge } from "@/components/shared/status-badge";
import { VEHICLE_META, VEHICLE_TYPES, availabilityLevel } from "@/constants/vehicles";
import { getParkingLotDetail } from "@/server/views/parking-lots";
import { LotMap } from "@/components/shared/lot-map";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

const LEVEL_TEXT = {
  available: "text-available",
  limited: "text-limited",
  full: "text-full",
} as const;

export default async function ParkingLotDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lot = await getParkingLotDetail(id);
  if (!lot) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link
        href="/driver/parking"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to nearby parking
      </Link>

      <div
        className="rounded-[var(--radius-xl)] border border-border p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${lot.coverColor}18, transparent)`,
        }}
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <LotStatusBadge status={lot.status} />
              <Badge variant="outline" size="sm">
                {lot.operatorName}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {lot.name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {lot.addressLine}, {lot.city}, {lot.state}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1 font-medium">
                <Star className="size-4 fill-limited text-limited" />
                {lot.rating}
                <span className="font-normal text-muted-foreground">
                  ({lot.reviewCount} reviews)
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock className="size-4" />
                {lot.openTime === "00:00" && lot.closeTime === "23:59"
                  ? "Open 24 hours"
                  : `${lot.openTime} – ${lot.closeTime}`}
              </span>
            </div>
          </div>
          {lot.status === "ACTIVE" ? (
            <Button size="lg" asChild>
              <Link href={`/driver/book/${lot.id}`}>
                Reserve this lot
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" disabled>
              Reserve this lot
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section>
            <h2 className="text-[15px] font-semibold">About this lot</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {lot.description}
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {lot.amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground"
                >
                  <ShieldCheck className="size-3.5 text-available" />
                  {a}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold">Location</h2>
            <LotMap
              latitude={lot.latitude}
              longitude={lot.longitude}
              name={lot.name}
              address={`${lot.addressLine}, ${lot.city}`}
              className="mt-3"
            />
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold">Availability & rates</h2>
          {VEHICLE_TYPES.map((type) => {
            const meta = VEHICLE_META[type];
            const Icon = meta.icon;
            const { total, available } = lot.capacity[type];
            const level = availabilityLevel(available, total);
            const pricing = lot.pricing[type];
            const pct = total === 0 ? 0 : (available / total) * 100;

            return (
              <div
                key={type}
                className="rounded-[var(--radius-lg)] border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4 text-muted-foreground" />
                    {meta.label}
                  </span>
                  <span className={cn("text-sm font-semibold tabular-nums", LEVEL_TEXT[level])}>
                    {available}/{total}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      level === "available"
                        ? "bg-available"
                        : level === "limited"
                          ? "bg-limited"
                          : "bg-full",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(pricing.baseRatePerHour)}/hr</span>
                  <span>{formatCurrency(pricing.dailyMaxRate)} daily max</span>
                </div>
              </div>
            );
          })}

          <Button size="lg" className="mt-1" asChild disabled={lot.status !== "ACTIVE"}>
            <Link href={`/driver/book/${lot.id}`}>
              Reserve this lot
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
