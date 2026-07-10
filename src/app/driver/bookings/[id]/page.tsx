import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Car, Calendar, Receipt, Clock } from "lucide-react";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import { CancelBookingButton } from "@/components/driver/cancel-booking-button";
import { QrPassCard } from "@/components/driver/qr-pass-card";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getDriverBooking } from "@/server/views/bookings";
import { qrService } from "@/modules/qr/qr.service";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/format";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionUser();
  const driverProfile = await prisma.driverProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const booking = await getDriverBooking(driverProfile.id, id);
  if (!booking) notFound();

  const hasQr = booking.status === "CONFIRMED" || booking.status === "ACTIVE";
  const qrImage = hasQr ? await qrService.getImageForBooking(session!.id, booking.id).catch(() => null) : null;

  const durationMin = Math.round(
    (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) /
      60000,
  );
  const canCancel = booking.status === "CONFIRMED" || booking.status === "PENDING";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/driver/bookings"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to bookings
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            {booking.bookingNumber}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {booking.lotName}
          </h1>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {hasQr && qrImage && (
        <QrPassCard
          imageDataUrl={qrImage.imageDataUrl}
          code={qrImage.code}
          qrStatus={booking.qrStatus}
          helperText={`Present this code at the ${booking.status === "ACTIVE" ? "exit" : "entrance"} barrier to ${
            booking.status === "ACTIVE" ? "check out" : "check in"
          }.`}
        />
      )}

      {booking.status === "PENDING" && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-dashed border-border bg-card p-7 text-center">
          <Clock className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Awaiting payment confirmation</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Your QR pass will appear here once the lot operator confirms your payment
            (e.g. cash at the gate).
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <DetailCard
          icon={<MapPin className="size-4" />}
          label="Location"
          lines={[booking.zoneName, `Space ${booking.spaceCode}`, `${booking.lotAddress}, ${booking.lotCity}`]}
        />
        <DetailCard
          icon={<Car className="size-4" />}
          label="Vehicle"
          lines={[booking.vehiclePlate]}
          extra={<VehicleTypeBadge type={booking.vehicleType} className="mt-1" />}
        />
        <DetailCard
          icon={<Calendar className="size-4" />}
          label="Reservation window"
          lines={[
            formatDateTime(booking.startTime),
            `${formatDuration(durationMin)} duration`,
          ]}
        />
        <DetailCard
          icon={<Receipt className="size-4" />}
          label="Payment"
          lines={[
            formatCurrency(booking.totalAmount, booking.currency.toUpperCase()),
            booking.status === "PENDING" ? "Awaiting payment" : "Paid",
          ]}
        />
      </div>

      {(booking.actualCheckInAt || booking.actualCheckOutAt) && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5">
          <p className="text-[13px] font-semibold">Activity</p>
          <div className="mt-3 flex flex-col gap-3">
            <TimelineRow label="Booking created" time={booking.createdAt} done />
            {booking.actualCheckInAt && (
              <TimelineRow label="Checked in" time={booking.actualCheckInAt} done />
            )}
            {booking.actualCheckOutAt && (
              <TimelineRow label="Checked out" time={booking.actualCheckOutAt} done />
            )}
          </div>
        </div>
      )}

      {canCancel && <CancelBookingButton bookingId={booking.id} />}
    </div>
  );
}

function DetailCard({
  icon,
  label,
  lines,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  lines: string[];
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        {lines.map((line, i) => (
          <p key={i} className={i === 0 ? "text-[15px] font-medium" : "text-sm text-muted-foreground"}>
            {line}
          </p>
        ))}
      </div>
      {extra}
    </div>
  );
}

function TimelineRow({
  label,
  time,
  done,
}: {
  label: string;
  time: string;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={
          "size-2 rounded-full " + (done ? "bg-available" : "bg-border-strong")
        }
      />
      <span className="flex-1 text-sm">{label}</span>
      <span className="text-xs text-muted-foreground">{formatDateTime(time)}</span>
    </div>
  );
}
