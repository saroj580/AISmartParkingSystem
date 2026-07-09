import type { Payment as PrismaPayment, Booking as PrismaBooking, ParkingLot as PrismaParkingLot } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Payment } from "@/types/domain";

type PaymentRow = PrismaPayment & { booking: PrismaBooking & { lot: PrismaParkingLot } };

function toPaymentVM(p: PaymentRow): Payment {
  return {
    id: p.id,
    bookingNumber: p.booking.bookingNumber,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    method: "Card",
    cardBrand: "Card",
    cardLast4: "••••",
    createdAt: p.createdAt.toISOString(),
    lotName: p.booking.lot.name,
  };
}

export async function listDriverPayments(driverId: string): Promise<Payment[]> {
  const rows = await prisma.payment.findMany({
    where: { driverId },
    orderBy: { createdAt: "desc" },
    include: { booking: { include: { lot: true } } },
  });
  return rows.map(toPaymentVM);
}
