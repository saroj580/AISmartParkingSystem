import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { listDriverPayments } from "@/server/views/payments";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/shared/empty-state";

export default async function PaymentsPage() {
  const session = await getSessionUser();
  const driverProfile = await prisma.driverProfile.findUniqueOrThrow({ where: { userId: session!.id } });
  const payments = await listDriverPayments(driverProfile.id);

  const totalSpent = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Payment history"
        description={`${formatCurrency(totalSpent)} spent across ${payments.length} transactions`}
      />

      {payments.length === 0 ? (
        <EmptyState icon={<CreditCard />} title="No payments yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">
                  {p.bookingNumber}
                </TableCell>
                <TableCell className="font-medium">{p.lotName}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="size-3.5" />
                    {p.cardBrand} {p.cardLast4}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(p.createdAt)}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={p.status} />
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(p.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
