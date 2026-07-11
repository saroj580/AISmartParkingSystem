import { paymentsRepository } from "@/modules/payments/payments.repository";
import { vehiclesRepository } from "@/modules/vehicles/vehicles.repository";
import { parkingLotsRepository } from "@/modules/parking-lots/parking-lots.repository";
import { notificationService } from "@/modules/notifications/notifications.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/errors/AppError";
import { createModuleLogger } from "@/lib/logger";
import type { RefundPaymentInput } from "@/modules/payments/payments.validators";
import type { PaginationResult } from "@/helpers/pagination";
import type { Role } from "@prisma/client";

const log = createModuleLogger("payments-service");

export const paymentsService = {
  /**
   * Refunds are recorded directly rather than routed through a payment gateway — payments in
   * this deployment are settled in cash at the lot, so a "refund" is an operator/admin
   * acknowledgement that cash was returned to the driver, not a card reversal.
   */
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

    const refund = await paymentsRepository.createRefund({
      paymentId: payment.id,
      amount: refundAmount,
      reason: input.reason,
      status: "SUCCEEDED",
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
};
