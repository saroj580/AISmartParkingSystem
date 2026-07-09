"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { VehicleTypeBadge } from "@/components/shared/vehicle-type-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types/domain";
import { markBookingPaidCash } from "@/app/operator/bookings/actions";

export function BookingsClient({
  bookings,
  lots,
}: {
  bookings: Booking[];
  lots: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [lotId, setLotId] = useState("ALL");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [confirming, setConfirming] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (lotId !== "ALL" && b.lotId !== lotId) return false;
      if (status !== "ALL" && b.status !== status) return false;
      if (query && !`${b.driverName} ${b.bookingNumber} ${b.vehiclePlate}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [bookings, query, lotId, status]);

  async function handleMarkPaid(bookingId: string) {
    setConfirming(bookingId);
    const result = await markBookingPaidCash(bookingId);
    setConfirming(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Payment confirmed — QR pass issued to the driver");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Bookings"
        description={`${filtered.length} of ${bookings.length} bookings`}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          leadingIcon={<Search />}
          placeholder="Search by customer, plate, or booking ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={lotId} onValueChange={setLotId}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All lots</SelectItem>
            {lots.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as BookingStatus | "ALL")}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending payment</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search />} title="No bookings match your filters" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Lot</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.bookingNumber}</TableCell>
                <TableCell className="font-medium">{b.driverName}</TableCell>
                <TableCell className="text-muted-foreground">{b.lotName}</TableCell>
                <TableCell><VehicleTypeBadge type={b.vehicleType} /></TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{b.vehiclePlate}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(b.startTime)}</TableCell>
                <TableCell><BookingStatusBadge status={b.status} /></TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(b.totalAmount)}</TableCell>
                <TableCell>
                  {b.status === "PENDING" && (
                    <Button size="sm" variant="secondary" disabled={confirming === b.id} onClick={() => handleMarkPaid(b.id)}>
                      {confirming === b.id ? "Confirming…" : "Mark paid (cash)"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
