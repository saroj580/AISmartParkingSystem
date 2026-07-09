import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { Booking } from "@/types/domain";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";

export function BookingCard({
  booking,
  className,
}: {
  booking: Booking;
  className?: string;
}) {
  const durationMin = Math.round(
    (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) /
      60000,
  );

  return (
    <Link
      href={`/driver/bookings/${booking.id}`}
      className={cn(
        "block rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground">
            {booking.bookingNumber}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold">{booking.lotName}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {booking.zoneName} · Space {booking.spaceCode}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <VehicleTypeBadge type={booking.vehicleType} />
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
          <Clock className="size-3.5 text-muted-foreground" />
          {formatDuration(durationMin)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">
          {formatDateTime(booking.startTime)}
        </span>
        <span className="font-semibold">
          {formatCurrency(booking.totalAmount)}
        </span>
      </div>
    </Link>
  );
}
