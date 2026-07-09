"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrPreview } from "@/components/ui/qr-preview";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import type { ParkingLot, Vehicle, VehicleType } from "@/types/domain";

export function ConfirmationStep({
  lot,
  vehicleType,
  vehicle,
  date,
  startHour,
  duration,
  total,
  bookingNumber,
}: {
  lot: ParkingLot;
  vehicleType: VehicleType;
  vehicle: Vehicle;
  date: Date;
  startHour: number;
  duration: number;
  total: number;
  bookingNumber: string;
}) {
  const formatHour = (h: number) => {
    const hh = h % 24;
    if (hh === 0) return "12:00 AM";
    if (hh === 12) return "12:00 PM";
    return hh > 12 ? `${hh - 12}:00 PM` : `${hh}:00 AM`;
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex size-16 items-center justify-center rounded-full bg-available-subtle text-available"
      >
        <CheckCircle2 className="size-9" />
      </motion.span>

      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
        Booking confirmed
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Your space is reserved. Show this QR code at the entrance.
      </p>

      <div className="mt-7 w-full rounded-[var(--radius-xl)] border border-border bg-card p-6">
        <div className="mx-auto w-44">
          <QrPreview token={`QR${bookingNumber}`} />
        </div>
        <p className="mt-4 font-mono text-sm font-semibold tracking-wide">
          {bookingNumber}
        </p>

        <div className="mt-5 flex flex-col gap-2.5 border-t border-border pt-5 text-left text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4" />
              {lot.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Vehicle</span>
            <VehicleTypeBadge type={vehicleType} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Plate</span>
            <span className="font-medium">{vehicle.plateNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Window</span>
            <span className="font-medium">
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              , {formatHour(startHour)} – {formatHour(startHour + duration)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2.5">
            <span className="font-semibold">Total paid</span>
            <span className="font-display text-base font-semibold">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row">
        <Button variant="secondary" className="flex-1">
          <Download className="size-4" />
          Save pass
        </Button>
        <Button className="flex-1" asChild>
          <Link href="/driver/bookings">View my bookings</Link>
        </Button>
      </div>
    </div>
  );
}
