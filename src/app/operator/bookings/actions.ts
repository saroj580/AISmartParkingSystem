"use server";

import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { bookingsService } from "@/modules/bookings/bookings.service";
import { qrService } from "@/modules/qr/qr.service";

const nanoid = customAlphabet("0123456789", 10);

/**
 * Records a cash payment for a booking and confirms it — the path for operators without a
 * connected Stripe account (common for smaller lots that only accept cash at the barrier).
 */
export async function markBookingPaidCash(bookingId: string) {
  const session = await getSessionUser();
  if (!session || session.role !== "OPERATOR") {
    return { success: false as const, error: "Please sign in as an operator to confirm payments." };
  }

  const operatorId = await parkingLotsRepository.getOperatorIdForUser(session.id);
  if (!operatorId) {
    return { success: false as const, error: "Only operators can confirm payments." };
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { lot: true } });
  if (!booking || booking.lot.operatorId !== operatorId) {
    return { success: false as const, error: "You do not have access to this booking." };
  }
  if (booking.status !== "PENDING") {
    return { success: false as const, error: `Cannot confirm a booking with status ${booking.status}.` };
  }

  try {
    const existingPayment = await prisma.payment.findUnique({ where: { bookingId } });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "SUCCEEDED", paidAt: new Date() },
      });
    } else {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          driverId: booking.driverId,
          invoiceNumber: `INV-${nanoid()}`,
          amount: booking.totalAmount,
          currency: booking.currency,
          status: "SUCCEEDED",
          paidAt: new Date(),
        },
      });
    }

    const confirmed = await bookingsService.markConfirmed(booking.id);
    await qrService.issueForBooking(confirmed.id);

    revalidatePath("/operator/bookings");
    revalidatePath("/operator");
    revalidatePath("/driver/bookings");

    return { success: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't confirm payment.";
    return { success: false as const, error: message };
  }
}
