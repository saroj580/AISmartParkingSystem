import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { PercentBarChart } from "@/components/charts/percent-bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getOperatorAnalytics } from "@/server/views/operator-analytics";
import { listLotsForOperator } from "@/server/views/parking-lots";
import { occupancyPct } from "@/data/lots";

export default async function OperatorAnalyticsPage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });

  const [analytics, lots] = await Promise.all([
    getOperatorAnalytics(operatorProfile.id),
    listLotsForOperator(operatorProfile.id),
  ]);

  const utilizationData = lots.map((l) => ({ label: l.name.split(" ")[0] ?? l.name, value: occupancyPct(l) }));
  const totalVehicleBookings = analytics.vehicleDistribution.reduce((s, d) => s + d.value, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Analytics" description="Deeper insight into demand and utilization." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peak hours</CardTitle>
            <CardDescription>Check-ins by hour of day, all time</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={analytics.peakHours} label="Check-ins" colorIndex={0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings this week</CardTitle>
            <CardDescription>Daily bookings created, last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={analytics.bookingsDaily} label="Bookings" colorIndex={2} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle distribution</CardTitle>
            <CardDescription>Share of bookings by vehicle type</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <DonutChart data={analytics.vehicleDistribution} centerLabel="Bookings" centerValue={totalVehicleBookings.toString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization by lot</CardTitle>
            <CardDescription>Percent of capacity in use, current</CardDescription>
          </CardHeader>
          <CardContent>
            <PercentBarChart data={utilizationData} label="Utilization" colorIndex={3} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
