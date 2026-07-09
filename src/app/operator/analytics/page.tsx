"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import {
  PEAK_HOURS, OCCUPANCY_TREND, VEHICLE_DISTRIBUTION, LOT_UTILIZATION, BOOKINGS_DAILY,
} from "@/data/analytics";

export default function OperatorAnalyticsPage() {
  const utilizationData = LOT_UTILIZATION.map((l) => ({
    label: l.name.replace(/(SmartDeck|Central|Yard|North|Pier 3)/, "").trim().split(" ")[0] ?? l.name,
    value: l.value,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Analytics" description="Deeper insight into demand and utilization." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peak hours</CardTitle>
            <CardDescription>Average concurrent check-ins by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={PEAK_HOURS} label="Check-ins" colorIndex={0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy over the day</CardTitle>
            <CardDescription>Percent of total capacity in use</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart
              data={OCCUPANCY_TREND}
              valuePrefix=""
              primaryLabel="Occupancy"
              secondaryLabel="Yesterday"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings this week</CardTitle>
            <CardDescription>Daily completed reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={BOOKINGS_DAILY} label="Bookings" colorIndex={2} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle distribution</CardTitle>
            <CardDescription>Share of bookings by vehicle type</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <DonutChart data={VEHICLE_DISTRIBUTION} centerLabel="Bookings" centerValue={VEHICLE_DISTRIBUTION.reduce((s, d) => s + d.value, 0).toString()} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Utilization by lot</CardTitle>
            <CardDescription>Percent of capacity in use, current period</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={utilizationData} label="Utilization" valueFormatter={(v) => `${v}%`} colorIndex={3} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
