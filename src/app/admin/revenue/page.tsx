"use client";

import { Wallet, TrendingUp, Percent, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { OPERATORS } from "@/data/customers";
import { REVENUE_MONTHLY } from "@/data/analytics";

export default function AdminRevenuePage() {
  const totalRevenue = OPERATORS.reduce((s, o) => s + o.revenue, 0);
  const platformFee = totalRevenue * 0.08;

  const byCity = Object.entries(
    OPERATORS.reduce<Record<string, number>>((acc, o) => {
      acc[o.city] = (acc[o.city] ?? 0) + o.revenue;
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label, value }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Revenue" description="Platform-wide earnings and take rate." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Gross merchandise value" value={`$${(totalRevenue / 1000).toFixed(0)}K`} delta={16.2} icon={<Wallet />} trend={[30, 36, 34, 44, 48, 52, 60]} trendColor="#2a78d6" />
        <MetricCard label="Platform fees earned" value={`$${(platformFee / 1000).toFixed(1)}K`} delta={15.4} icon={<Percent />} trend={[2, 3, 3, 4, 4, 4, 5]} trendColor="#1baf7a" />
        <MetricCard label="Take rate" value="8.0%" icon={<TrendingUp />} trend={[8, 8, 8, 8, 8, 8, 8]} trendColor="#eda100" />
        <MetricCard label="Paying operators" value={OPERATORS.filter((o) => o.status === "active").length.toString()} icon={<Building2 />} trend={[3, 3, 4, 4, 5, 5, 5]} trendColor="#4a3aa7" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Platform GMV, year to date</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={REVENUE_MONTHLY} primaryLabel="This year" secondaryLabel="Last year" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by city</CardTitle>
            <CardDescription>Top contributing markets</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byCity} label="Revenue" valueFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} colorIndex={2} height={220} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold">Operator payouts</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operator</TableHead>
              <TableHead>Gross revenue</TableHead>
              <TableHead>Platform fee (8%)</TableHead>
              <TableHead className="text-right">Net payout</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...OPERATORS].sort((a, b) => b.revenue - a.revenue).map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.company}</TableCell>
                <TableCell className="tabular-nums">${o.revenue.toLocaleString()}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  ${(o.revenue * 0.08).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  ${(o.revenue * 0.92).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
