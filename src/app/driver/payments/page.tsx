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
import { DRIVER_PAYMENTS } from "@/data/payments";
import { formatDateTime } from "@/lib/format";

export default function PaymentsPage() {
  const totalSpent = DRIVER_PAYMENTS.filter((p) => p.status === "SUCCEEDED").reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Payment history"
        description={`$${totalSpent.toFixed(2)} spent across ${DRIVER_PAYMENTS.length} transactions`}
      />

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
          {DRIVER_PAYMENTS.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs">
                {p.bookingNumber}
              </TableCell>
              <TableCell className="font-medium">{p.lotName}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="size-3.5" />
                  {p.cardBrand} •••• {p.cardLast4}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(p.createdAt)}
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={p.status} />
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                ${p.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
