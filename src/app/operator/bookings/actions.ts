"use server";

import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";
import { qrService } from "@/modules/qr/qr.service";

const nanoid = customAlphabet("0123456789", 10);

/**
 * Records a cash payment for a booking and confirms it — the path for operators at lots that
 * only accept cash at the barrier (there is no online payment gateway configured).
 *
 * The status transition is conditional (`PENDING` -> `CONFIRMED`, guarded inside the same
 * transaction as the payment write) so this can never race the per-minute expired-hold release
 * job into confirming — and creating a paid invoice for — a booking whose hold already lapsed
 * and whose space may have been rebooked by someone else in the meantime.
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
    const confirmed = await prisma.$transaction(async (tx) => {
      const didConfirm = await bookingsRepository.transitionStatus(tx, booking.id, "PENDING", "CONFIRMED");
      if (!didConfirm) {
        throw new Error("This booking's hold expired or it was already resolved — refresh and try again.");
      }

      const existingPayment = await tx.payment.findUnique({ where: { bookingId } });

      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: { status: "SUCCEEDED", paidAt: new Date() },
        });
      } else {
        await tx.payment.create({
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

      return booking.id;
    });

    await qrService.issueForBooking(confirmed);

    revalidatePath("/operator/bookings");
    revalidatePath("/operator");
    revalidatePath("/driver/bookings");

    return { success: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't confirm payment.";
    return { success: false as const, error: message };
  }
}
