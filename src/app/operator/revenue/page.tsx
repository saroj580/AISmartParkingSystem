import { Wallet, TrendingUp, Receipt, PiggyBank } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { PercentBarChart } from "@/components/charts/percent-bar-chart";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listOperatorBookings } from "@/server/views/bookings";
import { listLotsForOperator } from "@/server/views/parking-lots";
import { getOperatorRevenueTotal } from "@/server/views/operator-stats";
import { getOperatorAnalytics } from "@/server/views/operator-analytics";
import { occupancyPct } from "@/data/lots";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default async function OperatorRevenuePage() {
  const session = await getSessionUser();
  const operatorProfile = await prisma.operatorProfile.findUniqueOrThrow({ where: { userId: session!.id } });

  const [total, bookings, lots, analytics] = await Promise.all([
    getOperatorRevenueTotal(operatorProfile.id),
    listOperatorBookings(operatorProfile.id),
    listLotsForOperator(operatorProfile.id),
    getOperatorAnalytics(operatorProfile.id),
  ]);

  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const avgTicket = total / Math.max(completedCount, 1);
  const utilizationData = lots.slice(0, 6).map((l) => ({ label: l.name.split(" ")[0] ?? l.name, value: occupancyPct(l) }));
  const transactions = bookings.filter((b) => b.status === "COMPLETED" || b.status === "ACTIVE").slice(0, 12);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Revenue" description="Earnings across all your parking lots." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total revenue" value={formatCurrency(total)} icon={<Wallet />} trend={[40, 48, 44, 56, 60, 58, 68]} trendColor="#2a78d6" />
        <MetricCard label="Net payout" value={formatCurrency(total * 0.88)} icon={<PiggyBank />} trend={[35, 42, 40, 50, 53, 52, 60]} trendColor="#1baf7a" />
        <MetricCard label="Avg. ticket size" value={formatCurrency(avgTicket)} icon={<TrendingUp />} trend={[10, 11, 12, 11, 13, 12, 14]} trendColor="#eda100" />
        <MetricCard label="Completed transactions" value={completedCount.toString()} icon={<Receipt />} trend={[8, 9, 10, 9, 11, 12, 13]} trendColor="#4a3aa7" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Last 7 days, from successful payments</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={analytics.revenueTrend} primaryLabel="Revenue" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilization by lot</CardTitle>
            <CardDescription>Percent of capacity in use</CardDescription>
          </CardHeader>
          <CardContent>
            <PercentBarChart data={utilizationData} label="Utilization" colorIndex={1} height={220} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold">Transactions</h2>
        {transactions.length === 0 ? (
          <EmptyState icon={<Receipt />} title="No transactions yet" />
        ) : (
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
              {transactions.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.bookingNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{b.lotName}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(b.startTime)}</TableCell>
                  <TableCell><PaymentStatusBadge status="SUCCEEDED" /></TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(b.totalAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
