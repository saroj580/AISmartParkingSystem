import type { Prisma, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaginationResult } from "@/helpers/pagination";

export const paymentsRepository = {
  create(data: Prisma.PaymentUncheckedCreateInput) {
    return prisma.payment.create({ data });
  },

  findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: { booking: { include: { lot: true } }, driver: { include: { user: true } }, refunds: true },
    });
  },

  findByBookingId(bookingId: string) {
    return prisma.payment.findUnique({ where: { bookingId } });
  },

  findByStripeIntentId(stripePaymentIntentId: string) {
    return prisma.payment.findUnique({
      where: { stripePaymentIntentId },
      include: { booking: true, driver: { include: { user: true } } },
    });
  },

  update(id: string, data: Prisma.PaymentUpdateInput) {
    return prisma.payment.update({ where: { id }, data });
  },

  createRefund(data: Prisma.RefundUncheckedCreateInput) {
    return prisma.refund.create({ data });
  },

  updateRefund(id: string, data: Prisma.RefundUpdateInput) {
    return prisma.refund.update({ where: { id }, data });
  },

  async listForDriver(driverId: string, pagination: PaginationResult, status?: PaymentStatus) {
    const where: Prisma.PaymentWhereInput = { driverId, ...(status ? { status } : {}) };
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
        include: { booking: { include: { lot: true, space: true } } },
      }),
      prisma.payment.count({ where }),
    ]);
    return { items, total };
  },
};
