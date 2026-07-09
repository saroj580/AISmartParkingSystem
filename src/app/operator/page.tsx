import Link from "next/link";
import { Plus, Wallet, CalendarCheck, Activity, QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import { AvailabilityRow } from "@/components/shared/availability-row";
import { operatorLots, occupancyPct } from "@/data/lots";
import { OPERATOR_BOOKINGS, operatorRevenueTotal } from "@/data/operator-bookings";
import { REVENUE_WEEKLY, VEHICLE_DISTRIBUTION } from "@/data/analytics";
import { CURRENT_OPERATOR } from "@/data/user";
import { formatDateTime } from "@/lib/format";

export default function OperatorDashboardPage() {
  const lots = operatorLots(CURRENT_OPERATOR.id);
  const totalRevenue = operatorRevenueTotal();
  const activeCheckIns = OPERATOR_BOOKINGS.filter((b) => b.status === "ACTIVE").length;
  const todayBookings = OPERATOR_BOOKINGS.filter(
    (b) => new Date(b.startTime).toDateString() === new Date().toDateString(),
  ).length;
  const avgOccupancy = Math.round(
    lots.reduce((sum, l) => sum + occupancyPct(l), 0) / lots.length,
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview across your {lots.length} parking lots.
          </p>
        </div>
        <Button asChild>
          <Link href="/operator/lots">
            <Plus className="size-4" />
            Add parking lot
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          delta={12.4}
          icon={<Wallet />}
          trend={[40, 48, 44, 56, 60, 58, 68]}
          trendColor="#2a78d6"
        />
        <MetricCard
          label="Today's bookings"
          value={todayBookings.toString()}
          delta={4.1}
          icon={<CalendarCheck />}
          trend={[6, 8, 7, 9, 10, 9, 12]}
          trendColor="#1baf7a"
        />
        <MetricCard
          label="Avg. occupancy"
          value={`${avgOccupancy}%`}
          delta={-2.3}
          invertDelta
          icon={<Activity />}
          trend={[70, 74, 68, 76, 72, 78, 74]}
          trendColor="#eda100"
        />
        <MetricCard
          label="Active check-ins"
          value={activeCheckIns.toString()}
          icon={<QrCode />}
          trend={[3, 5, 4, 6, 5, 7, 6]}
          trendColor="#4a3aa7"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue this week</CardTitle>
            <CardDescription>Compared to the previous 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={REVENUE_WEEKLY} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle distribution</CardTitle>
            <CardDescription>Bookings by vehicle type, this month</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <DonutChart
              data={VEHICLE_DISTRIBUTION}
              centerValue={VEHICLE_DISTRIBUTION.reduce((s, d) => s + d.value, 0).toLocaleString()}
              centerLabel="Total"
            />
            <div className="flex w-full flex-col gap-2">
              {VEHICLE_DISTRIBUTION.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: ["#2a78d6", "#1baf7a", "#eda100"][i] }}
                    />
                    {d.name}
                  </span>
                  <span className="font-medium tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Your parking lots</h2>
          <Link href="/operator/lots" className="text-sm font-medium text-brand hover:underline">
            Manage all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lots.map((lot) => (
            <Link
              key={lot.id}
              href={`/operator/lots/${lot.id}`}
              className="rounded-[var(--radius-lg)] border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold">{lot.name}</p>
                <span className="text-sm font-semibold text-brand">
                  {occupancyPct(lot)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{lot.city}</p>
              <div className="mt-4">
                <AvailabilityRow capacity={lot.capacity} compact />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Recent bookings</h2>
          <Link href="/operator/bookings" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {OPERATOR_BOOKINGS.slice(0, 6).map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.bookingNumber}</TableCell>
                <TableCell className="font-medium">{b.driverName}</TableCell>
                <TableCell className="text-muted-foreground">{b.lotName}</TableCell>
                <TableCell><VehicleTypeBadge type={b.vehicleType} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(b.startTime)}</TableCell>
                <TableCell><BookingStatusBadge status={b.status} /></TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${b.totalAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
