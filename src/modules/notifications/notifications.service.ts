import type { NotificationType } from "@prisma/client";
import { notificationsRepository } from "@/modules/notifications/notifications.repository";
import { emailTemplates } from "@/modules/notifications/notifications.templates";
import { sendEmail } from "@/lib/resend";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("notifications-service");

interface RecipientUser {
  id: string;
  email: string;
  firstName: string;
}

async function dispatch(params: {
  user: RecipientUser;
  type: NotificationType;
  subject: string;
  html: string;
  metadata?: Record<string, unknown>;
}) {
  const notification = await notificationsRepository.create({
    userId: params.user.id,
    type: params.type,
    channel: "EMAIL",
    subject: params.subject,
    content: params.html,
    metadata: params.metadata,
  });

  try {
    await sendEmail({ to: params.user.email, subject: params.subject, html: params.html });
    await notificationsRepository.markSent(notification.id);
  } catch (err) {
    log.error({ err, notificationId: notification.id }, "Notification dispatch failed");
    await notificationsRepository.markFailed(notification.id, (err as Error).message);
  }
}

export const notificationService = {
  sendWelcomeEmail(user: RecipientUser) {
    return dispatch({
      user,
      type: "BOOKING_CONFIRMATION",
      subject: "Welcome to Smart Parking",
      html: emailTemplates.welcome(user.firstName),
    });
  },

  sendBookingConfirmation(
    user: RecipientUser,
    params: { bookingNumber: string; lotName: string; spaceCode: string; startTime: Date; endTime: Date }
  ) {
    return dispatch({
      user,
      type: "BOOKING_CONFIRMATION",
      subject: `Booking Confirmed — ${params.bookingNumber}`,
      html: emailTemplates.bookingConfirmation({
        firstName: user.firstName,
        bookingNumber: params.bookingNumber,
        lotName: params.lotName,
        spaceCode: params.spaceCode,
        startTime: params.startTime.toLocaleString(),
        endTime: params.endTime.toLocaleString(),
      }),
      metadata: { bookingNumber: params.bookingNumber },
    });
  },

  sendPaymentConfirmation(
    user: RecipientUser,
    params: { amount: string; currency: string; invoiceNumber: string }
  ) {
    return dispatch({
      user,
      type: "PAYMENT_CONFIRMATION",
      subject: `Payment Received — ${params.invoiceNumber}`,
      html: emailTemplates.paymentConfirmation({ firstName: user.firstName, ...params }),
      metadata: { invoiceNumber: params.invoiceNumber },
    });
  },

  sendBookingReminder(
    user: RecipientUser,
    params: { bookingNumber: string; startTime: Date; lotName: string }
  ) {
    return dispatch({
      user,
      type: "BOOKING_REMINDER",
      subject: `Reminder — Booking ${params.bookingNumber} starts soon`,
      html: emailTemplates.bookingReminder({
        firstName: user.firstName,
        bookingNumber: params.bookingNumber,
        startTime: params.startTime.toLocaleString(),
        lotName: params.lotName,
      }),
      metadata: { bookingNumber: params.bookingNumber },
    });
  },

  sendBookingExpiry(user: RecipientUser, params: { bookingNumber: string }) {
    return dispatch({
      user,
      type: "BOOKING_EXPIRY",
      subject: `Booking Expired — ${params.bookingNumber}`,
      html: emailTemplates.bookingExpiry({ firstName: user.firstName, bookingNumber: params.bookingNumber }),
      metadata: { bookingNumber: params.bookingNumber },
    });
  },

  sendCheckIn(user: RecipientUser, params: { bookingNumber: string; lotName: string }) {
    return dispatch({
      user,
      type: "CHECK_IN",
      subject: `Checked In — ${params.bookingNumber}`,
      html: emailTemplates.checkIn({ firstName: user.firstName, ...params }),
      metadata: { bookingNumber: params.bookingNumber },
    });
  },

  sendCheckOut(user: RecipientUser, params: { bookingNumber: string; lotName: string }) {
    return dispatch({
      user,
      type: "CHECK_OUT",
      subject: `Checked Out — ${params.bookingNumber}`,
      html: emailTemplates.checkOut({ firstName: user.firstName, ...params }),
      metadata: { bookingNumber: params.bookingNumber },
    });
  },

  sendRefundConfirmation(user: RecipientUser, params: { amount: string; currency: string }) {
    return dispatch({
      user,
      type: "REFUND_CONFIRMATION",
      subject: "Refund Processed",
      html: emailTemplates.refundConfirmation({ firstName: user.firstName, ...params }),
    });
  },

  sendOperatorAlert(user: RecipientUser, message: string) {
    return dispatch({
      user,
      type: "OPERATOR_ALERT",
      subject: "Smart Parking Operator Alert",
      html: emailTemplates.operatorAlert({ firstName: user.firstName, message }),
    });
  },
};
