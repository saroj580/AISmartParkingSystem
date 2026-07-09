"use client";

import { Wallet, TrendingUp, Receipt, PiggyBank } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { OPERATOR_BOOKINGS, operatorRevenueTotal } from "@/data/operator-bookings";
import { REVENUE_MONTHLY, LOT_UTILIZATION } from "@/data/analytics";
import { formatDateTime } from "@/lib/format";

export default function OperatorRevenuePage() {
  const total = operatorRevenueTotal();
  const completedCount = OPERATOR_BOOKINGS.filter((b) => b.status === "COMPLETED").length;
  const avgTicket = total / Math.max(completedCount, 1);

  const utilizationData = LOT_UTILIZATION.slice(0, 3).map((l) => ({
    label: l.name.split(" ")[0] ?? l.name,
    value: l.value,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Revenue" description="Earnings across all your parking lots." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total revenue" value={`$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} delta={12.4} icon={<Wallet />} trend={[40, 48, 44, 56, 60, 58, 68]} trendColor="#2a78d6" />
        <MetricCard label="Net payout" value={`$${(total * 0.88).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} delta={11.8} icon={<PiggyBank />} trend={[35, 42, 40, 50, 53, 52, 60]} trendColor="#1baf7a" />
        <MetricCard label="Avg. ticket size" value={`$${avgTicket.toFixed(2)}`} delta={3.2} icon={<TrendingUp />} trend={[10, 11, 12, 11, 13, 12, 14]} trendColor="#eda100" />
        <MetricCard label="Completed transactions" value={completedCount.toString()} icon={<Receipt />} trend={[8, 9, 10, 9, 11, 12, 13]} trendColor="#4a3aa7" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly revenue trend</CardTitle>
            <CardDescription>Year to date, compared with prior year</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={REVENUE_MONTHLY} primaryLabel="This year" secondaryLabel="Last year" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilization by lot</CardTitle>
            <CardDescription>Percent of capacity in use</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={utilizationData} label="Utilization" valueFormatter={(v) => `${v}%`} colorIndex={1} height={220} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold">Transactions</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {OPERATOR_BOOKINGS.filter((b) => b.status === "COMPLETED" || b.status === "ACTIVE")
              .slice(0, 12)
              .map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.bookingNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{b.lotName}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(b.startTime)}</TableCell>
                  <TableCell><PaymentStatusBadge status="SUCCEEDED" /></TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">${b.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
