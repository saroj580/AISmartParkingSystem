import Link from "next/link";
import { ArrowRight, Clock, MapPin, QrCode, Wallet, Leaf, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/shared/metric-card";
import { ParkingLotCard } from "@/components/driver/parking-lot-card";
import { BookingCard } from "@/components/driver/booking-card";
import { CURRENT_DRIVER } from "@/data/user";
import { ACTIVE_BOOKING, UPCOMING_BOOKING } from "@/data/bookings";
import { PARKING_LOTS } from "@/data/lots";
import { DRIVER_NOTIFICATIONS } from "@/data/payments";
import { formatDateTime, relativeTime } from "@/lib/format";

export default function DriverDashboardPage() {
  const greeting = getGreeting();
  const nearby = PARKING_LOTS.filter((l) => l.status === "ACTIVE").slice(0, 3);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {greeting}, {CURRENT_DRIVER.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here’s what’s happening with your parking today.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/driver/parking">
            Find parking
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {ACTIVE_BOOKING && (
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-brand/30 bg-brand-subtle p-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand text-brand-foreground">
                <QrCode className="size-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-brand-subtle-foreground">
                    Vehicle currently parked
                  </p>
                  <Badge variant="available" dot>
                    Active
                  </Badge>
                </div>
                <p className="mt-1 font-display text-lg font-semibold">
                  {ACTIVE_BOOKING.lotName}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {ACTIVE_BOOKING.zoneName} · Space {ACTIVE_BOOKING.spaceCode}
                  <span className="mx-1">·</span>
                  <Clock className="size-3.5" />
                  Checked in {relativeTime(ACTIVE_BOOKING.actualCheckInAt!)}
                </p>
              </div>
            </div>
            <Button variant="secondary" asChild>
              <Link href={`/driver/bookings/${ACTIVE_BOOKING.id}`}>
                View QR pass
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total bookings"
          value={CURRENT_DRIVER.stats.totalBookings.toString()}
          icon={<CalendarCheck />}
          trend={[4, 6, 5, 8, 7, 9, 11]}
          trendColor="#2a78d6"
        />
        <MetricCard
          label="Hours parked"
          value={`${CURRENT_DRIVER.stats.hoursParked}h`}
          icon={<Clock />}
          trend={[20, 24, 22, 30, 28, 34, 38]}
          trendColor="#1baf7a"
        />
        <MetricCard
          label="Total spent"
          value={`$${CURRENT_DRIVER.stats.totalSpent.toLocaleString()}`}
          icon={<Wallet />}
          trend={[80, 120, 96, 140, 130, 160, 180]}
          trendColor="#eda100"
        />
        <MetricCard
          label="CO₂ saved"
          value={`${CURRENT_DRIVER.stats.co2SavedKg} kg`}
          icon={<Leaf />}
          trend={[2, 3, 3, 4, 5, 5, 6]}
          trendColor="#4a3aa7"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Nearby parking</h2>
            <Link
              href="/driver/parking"
              className="text-sm font-medium text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {nearby.map((lot) => (
              <ParkingLotCard key={lot.id} lot={lot} saved={CURRENT_DRIVER.savedLots.includes(lot.id)} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Upcoming booking</h2>
            <Link
              href="/driver/bookings"
              className="text-sm font-medium text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          {UPCOMING_BOOKING ? (
            <BookingCard booking={UPCOMING_BOOKING} />
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No upcoming bookings
            </div>
          )}

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Recent activity</h2>
              <Link
                href="/driver/notifications"
                className="text-sm font-medium text-brand hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-card">
              {DRIVER_NOTIFICATIONS.slice(0, 4).map((n) => (
                <div key={n.id} className="flex gap-3 p-4">
                  <span
                    className={
                      "mt-1.5 size-1.5 shrink-0 rounded-full " +
                      (n.read ? "bg-border-strong" : "bg-brand")
                    }
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-snug">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
