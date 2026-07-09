import Link from "next/link";
import { Plus, Wallet, CalendarCheck, Activity, QrCode, ArrowRight, MapPin } from "lucide-react";
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
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listLotsForOperator } from "@/server/views/parking-lots";
import { listOperatorBookings } from "@/server/views/bookings";
import { getOperatorRevenueTotal } from "@/server/views/operator-stats";
import { getOperatorAnalytics } from "@/server/views/operator-analytics";
import { occupancyPct } from "@/data/lots";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default async function OperatorDashboardPage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });

  const [lots, bookings, totalRevenue, analytics] = await Promise.all([
    listLotsForOperator(operatorProfile.id),
    listOperatorBookings(operatorProfile.id),
    getOperatorRevenueTotal(operatorProfile.id),
    getOperatorAnalytics(operatorProfile.id),
  ]);

  const activeCheckIns = bookings.filter((b) => b.status === "ACTIVE").length;
  const todayBookings = bookings.filter(
    (b) => new Date(b.startTime).toDateString() === new Date().toDateString(),
  ).length;
  const avgOccupancy = lots.length === 0 ? 0 : Math.round(lots.reduce((sum, l) => sum + occupancyPct(l), 0) / lots.length);
  const totalVehicleBookings = analytics.vehicleDistribution.reduce((s, d) => s + d.value, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview across your {lots.length} parking lot{lots.length === 1 ? "" : "s"}.
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
          value={formatCurrency(totalRevenue)}
          icon={<Wallet />}
          trend={[40, 48, 44, 56, 60, 58, 68]}
          trendColor="#2a78d6"
        />
        <MetricCard
          label="Today's bookings"
          value={todayBookings.toString()}
          icon={<CalendarCheck />}
          trend={[6, 8, 7, 9, 10, 9, 12]}
          trendColor="#1baf7a"
        />
        <MetricCard
          label="Avg. occupancy"
          value={`${avgOccupancy}%`}
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
            <CardDescription>Last 7 days, from successful payments</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={analytics.revenueTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle distribution</CardTitle>
            <CardDescription>Bookings by vehicle type</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <DonutChart
              data={analytics.vehicleDistribution}
              centerValue={totalVehicleBookings.toString()}
              centerLabel="Total"
            />
            <div className="flex w-full flex-col gap-2">
              {analytics.vehicleDistribution.map((d, i) => (
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
        {lots.length === 0 ? (
          <EmptyState icon={<MapPin />} title="No parking lots yet" description="Add your first lot to start accepting bookings." />
        ) : (
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
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Recent bookings</h2>
          <Link href="/operator/bookings" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {bookings.length === 0 ? (
          <EmptyState icon={<CalendarCheck />} title="No bookings yet" />
        ) : (
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
              {bookings.slice(0, 6).map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.bookingNumber}</TableCell>
                  <TableCell className="font-medium">{b.driverName}</TableCell>
                  <TableCell className="text-muted-foreground">{b.lotName}</TableCell>
                  <TableCell><VehicleTypeBadge type={b.vehicleType} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(b.startTime)}</TableCell>
                  <TableCell><BookingStatusBadge status={b.status} /></TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(b.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
