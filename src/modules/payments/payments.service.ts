import { customAlphabet } from "nanoid";
import type Stripe from "stripe";
import { paymentsRepository } from "@/modules/payments/payments.repository";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";
import { bookingsService } from "@/modules/bookings/bookings.service";
import { vehiclesRepository } from "@/modules/vehicles/vehicles.repository";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { qrService } from "@/modules/qr/qr.service";
import { notificationService } from "@/modules/notifications/notifications.service";
import { stripe, toStripeAmount, fromStripeAmount } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/errors/AppError";
import { createModuleLogger } from "@/lib/logger";
import type { RefundPaymentInput } from "@/modules/payments/payments.validators";
import type { PaginationResult } from "@/helpers/pagination";
import type { Role } from "@prisma/client";

const log = createModuleLogger("payments-service");
const nanoid = customAlphabet("0123456789", 10);

function generateInvoiceNumber(): string {
  return `INV-${nanoid()}`;
}

export const paymentsService = {
  async createIntent(userId: string, bookingId: string) {
    const driverId = await vehiclesRepository.getDriverIdForUser(userId);
    if (!driverId) throw new ForbiddenError("Only drivers can pay for bookings");

    const booking = await bookingsRepository.findByIdWithRelations(bookingId);
    if (!booking) throw new NotFoundError("Booking");
    if (booking.driverId !== driverId) throw new ForbiddenError("You do not have access to this booking");

    if (booking.status !== "PENDING") {
      throw new BadRequestError(`Cannot create a payment for a booking with status ${booking.status}`);
    }
    if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
      throw new BadRequestError("This booking's hold has expired — please create a new booking");
    }

    const existing = await paymentsRepository.findByBookingId(bookingId);
    if (existing) {
      if (existing.status === "SUCCEEDED") {
        throw new ConflictError("This booking has already been paid");
      }
      if (existing.status === "PENDING" && existing.stripeClientSecret) {
        return { paymentId: existing.id, clientSecret: existing.stripeClientSecret, amount: existing.amount };
      }
    }

    const amount = Number(booking.totalAmount);

    const intent = await stripe.paymentIntents.create({
      amount: toStripeAmount(amount),
      currency: booking.currency,
      metadata: { bookingId: booking.id, driverId },
      automatic_payment_methods: { enabled: true },
    });

    const payment = existing
      ? await paymentsRepository.update(existing.id, {
          stripePaymentIntentId: intent.id,
          stripeClientSecret: intent.client_secret,
          status: "PENDING",
        })
      : await paymentsRepository.create({
          bookingId: booking.id,
          driverId,
          invoiceNumber: generateInvoiceNumber(),
          amount,
          currency: booking.currency,
          status: "PENDING",
          stripePaymentIntentId: intent.id,
          stripeClientSecret: intent.client_secret,
        });

    return { paymentId: payment.id, clientSecret: intent.client_secret, amount };
  },

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        log.debug({ type: event.type }, "Unhandled Stripe webhook event type");
    }
  },

  async handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
    const payment = await paymentsRepository.findByStripeIntentId(intent.id);
    if (!payment) {
      log.warn({ intentId: intent.id }, "Received success webhook for unknown payment intent");
      return;
    }
    if (payment.status === "SUCCEEDED") return; // idempotent — webhook may be delivered more than once

    await paymentsRepository.update(payment.id, {
      status: "SUCCEEDED",
      paidAt: new Date(),
      stripeChargeId: typeof intent.latest_charge === "string" ? intent.latest_charge : undefined,
    });

    const booking = await bookingsService.markConfirmed(payment.bookingId);
    const qr = await qrService.issueForBooking(booking.id);

    const user = payment.driver.user;
    notificationService
      .sendPaymentConfirmation(
        { id: user.id, email: user.email, firstName: user.firstName },
        { amount: payment.amount.toFixed(2), currency: payment.currency, invoiceNumber: payment.invoiceNumber }
      )
      .catch((err) => log.error({ err, paymentId: payment.id }, "Failed to send payment confirmation"));

    const lot = await prisma.parkingLot.findUnique({ where: { id: booking.lotId } });
    const space = await prisma.parkingSpace.findUnique({ where: { id: booking.spaceId } });

    notificationService
      .sendBookingConfirmation(
        { id: user.id, email: user.email, firstName: user.firstName },
        {
          bookingNumber: booking.bookingNumber,
          lotName: lot?.name ?? "Parking Lot",
          spaceCode: space?.code ?? "",
          startTime: booking.startTime,
          endTime: booking.endTime,
        }
      )
      .catch((err) => log.error({ err, bookingId: booking.id }, "Failed to send booking confirmation"));

    log.info({ paymentId: payment.id, bookingId: booking.id, qrCodeId: qr.id }, "Payment succeeded, booking confirmed");
  },

  async handlePaymentFailed(intent: Stripe.PaymentIntent) {
    const payment = await paymentsRepository.findByStripeIntentId(intent.id);
    if (!payment) return;

    await paymentsRepository.update(payment.id, {
      status: "FAILED",
      failureReason: intent.last_payment_error?.message ?? "Payment failed",
    });
  },

  async refund(userId: string, role: Role, paymentId: string, input: RefundPaymentInput) {
    const payment = await paymentsRepository.findById(paymentId);
    if (!payment) throw new NotFoundError("Payment");

    if (role === "DRIVER") {
      const driverId = await vehiclesRepository.getDriverIdForUser(userId);
      if (payment.driverId !== driverId) throw new ForbiddenError("You do not have access to this payment");
    } else if (role === "OPERATOR") {
      const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
      if (payment.booking.lot.operatorId !== operatorId) {
        throw new ForbiddenError("You do not have access to this payment");
      }
    }

    if (payment.status !== "SUCCEEDED" && payment.status !== "PARTIALLY_REFUNDED") {
      throw new BadRequestError(`Cannot refund a payment with status ${payment.status}`);
    }

    const remaining = Number(payment.amount) - Number(payment.refundedAmount);
    const refundAmount = input.amount ?? remaining;

    if (refundAmount <= 0 || refundAmount > remaining) {
      throw new BadRequestError(`Refund amount must be between 0 and ${remaining.toFixed(2)}`);
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestError("This payment has no associated Stripe payment intent");
    }

    const stripeRefund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: toStripeAmount(refundAmount),
      reason: "requested_by_customer",
    });

    const refund = await paymentsRepository.createRefund({
      paymentId: payment.id,
      stripeRefundId: stripeRefund.id,
      amount: refundAmount,
      reason: input.reason,
      status: stripeRefund.status === "succeeded" ? "SUCCEEDED" : "PENDING",
    });

    const newRefundedTotal = Number(payment.refundedAmount) + refundAmount;
    await paymentsRepository.update(payment.id, {
      refundedAmount: newRefundedTotal,
      status: newRefundedTotal >= Number(payment.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED",
    });

    const user = payment.driver.user;
    notificationService
      .sendRefundConfirmation(
        { id: user.id, email: user.email, firstName: user.firstName },
        { amount: refundAmount.toFixed(2), currency: payment.currency }
      )
      .catch((err) => log.error({ err, paymentId: payment.id }, "Failed to send refund confirmation"));

    return refund;
  },

  async listMine(userId: string, pagination: PaginationResult) {
    const driverId = await vehiclesRepository.getDriverIdForUser(userId);
    if (!driverId) throw new ForbiddenError("Only drivers have payment history");
    return paymentsRepository.listForDriver(driverId, pagination);
  },

  async getById(userId: string, role: Role, paymentId: string) {
    const payment = await paymentsRepository.findById(paymentId);
    if (!payment) throw new NotFoundError("Payment");

    if (role === "DRIVER") {
      const driverId = await vehiclesRepository.getDriverIdForUser(userId);
      if (payment.driverId !== driverId) throw new ForbiddenError("You do not have access to this payment");
    } else if (role === "OPERATOR") {
      const operatorId = await parkingLotsRepository.getOperatorIdForUser(userId);
      if (payment.booking.lot.operatorId !== operatorId) {
        throw new ForbiddenError("You do not have access to this payment");
      }
    }

    return payment;
  },

  verifyWebhookSignature(rawBody: string, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  },

  toDisplayAmount: fromStripeAmount,
};
