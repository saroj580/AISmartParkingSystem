"use client";

import Link from "next/link";
import { Building2, Users, Wallet, Car, ArrowUpRight, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { OPERATORS } from "@/data/customers";
import { PLATFORM_GROWTH, VEHICLE_DISTRIBUTION } from "@/data/analytics";
import { PARKING_LOTS } from "@/data/lots";

export default function AdminAnalyticsPage() {
  const totalRevenue = OPERATORS.reduce((s, o) => s + o.revenue, 0);
  const totalSpaces = OPERATORS.reduce((s, o) => s + o.spaces, 0);
  const activeOperators = OPERATORS.filter((o) => o.status === "active").length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Platform analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A bird&apos;s-eye view of every operator, lot, and driver on HamroPark.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Platform revenue"
          value={`$${(totalRevenue / 1000).toFixed(0)}K`}
          delta={16.2}
          icon={<Wallet />}
          trend={[30, 36, 34, 44, 48, 52, 60]}
          trendColor="#2a78d6"
        />
        <MetricCard
          label="Active operators"
          value={activeOperators.toString()}
          delta={8.4}
          icon={<Building2 />}
          trend={[3, 3, 4, 4, 5, 5, 5]}
          trendColor="#1baf7a"
        />
        <MetricCard
          label="Registered drivers"
          value="18,204"
          delta={5.7}
          icon={<Users />}
          trend={[120, 140, 135, 160, 170, 168, 182]}
          trendColor="#eda100"
        />
        <MetricCard
          label="Managed spaces"
          value={totalSpaces.toLocaleString()}
          icon={<Car />}
          trend={[400, 420, 415, 460, 480, 470, 496]}
          trendColor="#4a3aa7"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform growth</CardTitle>
            <CardDescription>Monthly revenue and new operator signups</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={PLATFORM_GROWTH} primaryLabel="Revenue" secondaryLabel="New operators" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle mix</CardTitle>
            <CardDescription>Platform-wide booking share</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <DonutChart
              data={VEHICLE_DISTRIBUTION}
              centerLabel="Bookings"
              centerValue={VEHICLE_DISTRIBUTION.reduce((s, d) => s + d.value, 0).toString()}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Top operators by revenue</h2>
            <Link href="/admin/operators" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operator</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Lots</TableHead>
                <TableHead>Spaces</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...OPERATORS].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.company}</TableCell>
                  <TableCell className="text-muted-foreground">{o.city}</TableCell>
                  <TableCell className="tabular-nums">{o.lots}</TableCell>
                  <TableCell className="tabular-nums">{o.spaces}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    ${o.revenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h2 className="mb-3 text-[15px] font-semibold">Network snapshot</h2>
          <div className="flex flex-col gap-3">
            <SnapshotRow label="Total parking lots" value={PARKING_LOTS.length.toString()} />
            <SnapshotRow label="Cities live" value="41" />
            <SnapshotRow label="Avg. rating" value="4.6" />
            <SnapshotRow label="Uptime (30d)" value="99.97%" good />
          </div>
        </div>
      </div>
    </div>
  );
}

function SnapshotRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`inline-flex items-center gap-1 font-semibold ${good ? "text-available" : ""}`}>
        {good && <ArrowUpRight className="size-3.5" />}
        {value}
      </span>
    </div>
  );
}
