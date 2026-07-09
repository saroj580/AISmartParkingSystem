import type { Role } from "@prisma/client";
import { qrRepository } from "@/modules/qr/qr.repository";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";
import { bookingsService } from "@/modules/bookings/bookings.service";
import { vehiclesRepository } from "@/modules/vehicles/vehicles.repository";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { notificationService } from "@/modules/notifications/notifications.service";
import { generateSignedQrToken, verifySignedQrToken, renderQrCodeImage } from "@/lib/qrcode";
import { addSeconds } from "@/helpers/time";
import { QR_CODE_VALIDITY_BUFFER_MINUTES } from "@/constants/config";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/errors/AppError";

async function requireLotAccess(userId: string, role: Role, operatorId: string) {
  if (role === "ADMIN") return;
  if (role !== "OPERATOR") throw new ForbiddenError("Only operators or admins can scan QR codes");

  const callerOperatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
  if (callerOperatorId !== operatorId) {
    throw new ForbiddenError("You do not have access to this parking lot");
  }
}

export const qrService = {
  async issueForBooking(bookingId: string) {
    const existing = await qrRepository.findByBookingId(bookingId);
    if (existing) return existing;

    const booking = await bookingsRepository.findByIdWithRelations(bookingId);
    if (!booking) throw new NotFoundError("Booking");

    const token = generateSignedQrToken(bookingId);
    const expiresAt = addSeconds(booking.endTime, QR_CODE_VALIDITY_BUFFER_MINUTES * 60);

    return qrRepository.create({ bookingId, code: token, expiresAt, status: "ACTIVE" });
  },

  async getImageForBooking(userId: string, bookingId: string) {
    const driverId = await vehiclesRepository.getDriverIdForUser(userId);
    const booking = await bookingsRepository.findByIdWithRelations(bookingId);
    if (!booking) throw new NotFoundError("Booking");
    if (booking.driverId !== driverId) throw new ForbiddenError("You do not have access to this booking");

    const qr = await qrRepository.findByBookingId(bookingId);
    if (!qr) throw new NotFoundError("QR code has not been issued for this booking yet");

    const imageDataUrl = await renderQrCodeImage(qr.code);
    return { ...qr, imageDataUrl };
  },

  async checkIn(userId: string, role: Role, code: string) {
    verifySignedQrToken(code); // throws if tampered/malformed

    const qr = await qrRepository.findByCode(code);
    if (!qr) throw new NotFoundError("QR code");

    await requireLotAccess(userId, role, qr.booking.lot.operatorId);

    if (qr.status !== "ACTIVE") {
      throw new BadRequestError(`This QR code cannot be used for check-in (status: ${qr.status})`);
    }
    if (qr.expiresAt < new Date()) {
      await qrRepository.markStatus(qr.id, "EXPIRED");
      throw new BadRequestError("This QR code has expired");
    }
    if (qr.booking.status !== "CONFIRMED") {
      throw new BadRequestError(`Booking must be CONFIRMED to check in (current: ${qr.booking.status})`);
    }

    await qrRepository.update(qr.id, { status: "CHECKED_IN", checkInAt: new Date(), usedCount: { increment: 1 } });
    const booking = await bookingsService.markCheckedIn(qr.bookingId);

    const user = qr.booking.driver.user;
    notificationService
      .sendCheckIn({ id: user.id, email: user.email, firstName: user.firstName }, {
        bookingNumber: booking.bookingNumber,
        lotName: qr.booking.lot.name,
      })
      .catch(() => undefined);

    return booking;
  },

  async checkOut(userId: string, role: Role, code: string) {
    verifySignedQrToken(code);

    const qr = await qrRepository.findByCode(code);
    if (!qr) throw new NotFoundError("QR code");

    await requireLotAccess(userId, role, qr.booking.lot.operatorId);

    if (qr.status !== "CHECKED_IN") {
      throw new BadRequestError(`This QR code cannot be used for check-out (status: ${qr.status})`);
    }
    if (qr.booking.status !== "ACTIVE") {
      throw new BadRequestError(`Booking must be ACTIVE to check out (current: ${qr.booking.status})`);
    }

    await qrRepository.update(qr.id, { status: "USED", checkOutAt: new Date(), usedCount: { increment: 1 } });
    const booking = await bookingsService.markCheckedOut(qr.bookingId);

    const user = qr.booking.driver.user;
    notificationService
      .sendCheckOut({ id: user.id, email: user.email, firstName: user.firstName }, {
        bookingNumber: booking.bookingNumber,
        lotName: qr.booking.lot.name,
      })
      .catch(() => undefined);

    return booking;
  },
};
