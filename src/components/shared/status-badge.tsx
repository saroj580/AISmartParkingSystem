import { Badge } from "@/components/ui/badge";
import type { BookingStatus, PaymentStatus, LotStatus, QrStatus } from "@/types/domain";

const BOOKING_MAP: Record<BookingStatus, { label: string; variant: "brand" | "available" | "neutral" | "full" | "limited" }> = {
  PENDING: { label: "Pending", variant: "limited" },
  CONFIRMED: { label: "Confirmed", variant: "brand" },
  ACTIVE: { label: "Active", variant: "available" },
  COMPLETED: { label: "Completed", variant: "neutral" },
  CANCELLED: { label: "Cancelled", variant: "neutral" },
  EXPIRED: { label: "Expired", variant: "full" },
  NO_SHOW: { label: "No-show", variant: "full" },
};

const PAYMENT_MAP: Record<PaymentStatus, { label: string; variant: "brand" | "available" | "neutral" | "full" | "limited" }> = {
  PENDING: { label: "Pending", variant: "limited" },
  PROCESSING: { label: "Processing", variant: "brand" },
  SUCCEEDED: { label: "Paid", variant: "available" },
  FAILED: { label: "Failed", variant: "full" },
  REFUNDED: { label: "Refunded", variant: "neutral" },
  PARTIALLY_REFUNDED: { label: "Partial refund", variant: "limited" },
  CANCELLED: { label: "Cancelled", variant: "neutral" },
};

const LOT_MAP: Record<LotStatus, { label: string; variant: "available" | "neutral" | "limited" }> = {
  ACTIVE: { label: "Active", variant: "available" },
  INACTIVE: { label: "Inactive", variant: "neutral" },
  MAINTENANCE: { label: "Maintenance", variant: "limited" },
};

const QR_MAP: Record<QrStatus, { label: string; variant: "brand" | "available" | "neutral" | "full" }> = {
  ACTIVE: { label: "Ready to scan", variant: "brand" },
  CHECKED_IN: { label: "Checked in", variant: "available" },
  USED: { label: "Used", variant: "neutral" },
  EXPIRED: { label: "Expired", variant: "full" },
  INVALID: { label: "Invalid", variant: "full" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const m = BOOKING_MAP[status];
  return <Badge variant={m.variant} dot>{m.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const m = PAYMENT_MAP[status];
  return <Badge variant={m.variant} dot>{m.label}</Badge>;
}

export function LotStatusBadge({ status }: { status: LotStatus }) {
  const m = LOT_MAP[status];
  return <Badge variant={m.variant} dot>{m.label}</Badge>;
}

export function QrStatusBadge({ status }: { status: QrStatus }) {
  const m = QR_MAP[status];
  return <Badge variant={m.variant} dot>{m.label}</Badge>;
}
