import { customAlphabet } from "nanoid";
import { Prisma, type BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";
import { vehiclesRepository } from "@/modules/vehicles/vehicles.repository";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { pricingRepository } from "@/modules/pricing/pricing.repository";
import { pricingService } from "@/modules/pricing/pricing.service";
import { notificationService } from "@/modules/notifications/notifications.service";
import type { CreateBookingInput } from "@/modules/bookings/bookings.validators";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/errors/AppError";
import { invalidateCache } from "@/lib/redis";
import { minutesFromNow } from "@/helpers/time";
import { BOOKING_HOLD_MINUTES } from "@/constants/config";
import { createModuleLogger } from "@/lib/logger";
import type { PaginationResult } from "@/helpers/pagination";

const log = createModuleLogger("bookings-service");
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

function generateBookingNumber(): string {
  return `BK-${nanoid()}`;
}

export const bookingsService = {
  async create(userId: string, input: CreateBookingInput) {
    const driverId = await vehiclesRepository.getDriverIdForUser(userId);
    if (!driverId) throw new ForbiddenError("Only drivers can create bookings");

    const booking = await prisma.$transaction(
      async (tx) => {
        const vehicle = await tx.vehicle.findUnique({ where: { id: input.vehicleId } });
        if (!vehicle || vehicle.driverId !== driverId) {
          throw new NotFoundError("Vehicle");
        }
        if (!vehicle.isActive) {
          throw new BadRequestError("This vehicle is inactive");
        }

        // Row lock: guarantees no two concurrent requests can both pass the availability check
        // for the same space before one of them commits its status change.
        const [space] = await bookingsRepository.lockSpaceForUpdate(tx, input.spaceId);
        if (!space || !space.isActive) {
          throw new NotFoundError("Parking space");
        }

        if (space.vehicleType !== vehicle.type) {
          throw new BadRequestError("Vehicle type does not match this parking space's category");
        }

        if (space.status !== "AVAILABLE") {
          throw new ConflictError("This parking space is not currently available");
        }

        const overlap = await bookingsRepository.findOverlapping(tx, input.spaceId, input.startTime, input.endTime);
        if (overlap) {
          throw new ConflictError("This space is already booked for the selected time window");
        }

        const lot = await tx.parkingLot.findUnique({ where: { id: space.lotId } });
        if (!lot || lot.status !== "ACTIVE") {
          throw new BadRequestError("This parking lot is not currently accepting bookings");
        }

        const rule = await pricingRepository.findActiveRule(space.lotId, vehicle.type);
        if (!rule) {
          throw new BadRequestError("No active pricing is configured for this vehicle category at this lot");
        }

        const totalAmount = pricingService.calculateBookingCost(rule, input.startTime, input.endTime);

        const created = await bookingsRepository.create(tx, {
          bookingNumber: generateBookingNumber(),
          driverId,
          vehicleId: vehicle.id,
          lotId: space.lotId,
          spaceId: space.id,
          pricingRuleId: rule.id,
          startTime: input.startTime,
          endTime: input.endTime,
          totalAmount,
          currency: rule.currency,
          status: "PENDING",
          holdExpiresAt: minutesFromNow(BOOKING_HOLD_MINUTES),
        });

        await bookingsRepository.updateSpaceStatus(tx, space.id, "RESERVED");

        return created;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 15000, maxWait: 10000 }
    );

    await invalidateCache(`cache:availability:${booking.lotId}:*`);
    return booking;
  },

  async getById(userId: string, role: "DRIVER" | "OPERATOR" | "ADMIN", bookingId: string) {
    const booking = await bookingsRepository.findByIdWithRelations(bookingId);
    if (!booking) throw new NotFoundError("Booking");

    if (role === "ADMIN") return booking;

    if (role === "DRIVER") {
      const driverId = await vehiclesRepository.getDriverIdForUser(userId);
      if (booking.driverId !== driverId) throw new ForbiddenError("You do not have access to this booking");
      return booking;
    }

    const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
    if (booking.lot.operatorId !== operatorId) throw new ForbiddenError("You do not have access to this booking");
    return booking;
  },

  async listMine(userId: string, filters: { status?: BookingStatus }, pagination: PaginationResult) {
    const driverId = await vehiclesRepository.getDriverIdForUser(userId);
    if (!driverId) throw new ForbiddenError("Only drivers have bookings");
    return bookingsRepository.listForDriver(driverId, filters, pagination);
  },

  async listForMyLots(userId: string, filters: { status?: BookingStatus }, pagination: PaginationResult) {
    const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
    if (!operatorId) throw new ForbiddenError("Only operators can view lot bookings");
    return bookingsRepository.listForOperator(operatorId, filters, pagination);
  },

  async cancel(userId: string, bookingId: string, reason: string | undefined) {
    const driverId = await vehiclesRepository.getDriverIdForUser(userId);
    const booking = await bookingsRepository.findByIdWithRelations(bookingId);
    if (!booking) throw new NotFoundError("Booking");
    if (booking.driverId !== driverId) throw new ForbiddenError("You do not have access to this booking");

    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      throw new BadRequestError(`Cannot cancel a booking with status ${booking.status}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", cancelledAt: new Date(), cancellationReason: reason },
      });
      await bookingsRepository.updateSpaceStatus(tx, booking.spaceId, "AVAILABLE");
      return result;
    });

    await invalidateCache(`cache:availability:${booking.lotId}:*`);

    if (booking.payment?.status === "SUCCEEDED") {
      log.info(
        { bookingId, paymentId: booking.payment.id },
        "Booking cancelled after successful payment — refund must be requested explicitly via the payments API"
      );
    }

    return updated;
  },

  /** Called by the QR module on a successful check-in scan. */
  async markCheckedIn(bookingId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "ACTIVE", actualCheckInAt: new Date() },
      });
      await bookingsRepository.updateSpaceStatus(tx, booking.spaceId, "OCCUPIED");
      return booking;
    });
  },

  /** Called by the QR module on a successful check-out scan. */
  async markCheckedOut(bookingId: string) {
    const booking = await prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED", actualCheckOutAt: new Date() },
      });
      await bookingsRepository.updateSpaceStatus(tx, result.spaceId, "AVAILABLE");
      return result;
    });

    await invalidateCache(`cache:availability:${booking.lotId}:*`);
    return booking;
  },

  async markConfirmed(bookingId: string) {
    return bookingsRepository.update(bookingId, { status: "CONFIRMED" });
  },

  /** Background job: releases unpaid PENDING bookings whose hold window has lapsed. */
  async releaseExpiredHolds() {
    const expired = await bookingsRepository.findExpiredHolds(new Date());

    for (const booking of expired) {
      await prisma.$transaction(async (tx) => {
        await tx.booking.update({ where: { id: booking.id }, data: { status: "EXPIRED" } });
        await bookingsRepository.updateSpaceStatus(tx, booking.spaceId, "AVAILABLE");
      });

      await invalidateCache(`cache:availability:${booking.lotId}:*`);

      notificationService
        .sendBookingExpiry(
          { id: booking.driver.user.id, email: booking.driver.user.email, firstName: booking.driver.user.firstName },
          { bookingNumber: booking.bookingNumber }
        )
        .catch((err) => log.error({ err, bookingId: booking.id }, "Failed to send booking expiry notification"));
    }

    return expired.length;
  },

  /** Background job: sends a reminder email for confirmed bookings starting soon. */
  async sendUpcomingReminders(windowStart: Date, windowEnd: Date) {
    const upcoming = await bookingsRepository.findUpcomingForReminders(windowStart, windowEnd);

    for (const booking of upcoming) {
      await bookingsRepository.markReminderSent(booking.id);

      notificationService
        .sendBookingReminder(
          { id: booking.driver.user.id, email: booking.driver.user.email, firstName: booking.driver.user.firstName },
          { bookingNumber: booking.bookingNumber, startTime: booking.startTime, lotName: booking.lot.name }
        )
        .catch((err) => log.error({ err, bookingId: booking.id }, "Failed to send booking reminder"));
    }

    return upcoming.length;
  },
};
