import type { Prisma, QrStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const qrRepository = {
  create(data: Prisma.QrCodeUncheckedCreateInput) {
    return prisma.qrCode.create({ data });
  },

  findByCode(code: string) {
    return prisma.qrCode.findUnique({
      where: { code },
      include: { booking: { include: { lot: true, space: true, vehicle: true, driver: { include: { user: true } } } } },
    });
  },

  findByBookingId(bookingId: string) {
    return prisma.qrCode.findUnique({ where: { bookingId } });
  },

  /** QR codes past their validity window that were never scanned (ACTIVE) or never checked out (CHECKED_IN). */
  findLapsed(now: Date) {
    return prisma.qrCode.findMany({
      where: { status: { in: ["ACTIVE", "CHECKED_IN"] }, expiresAt: { lt: now } },
      include: { booking: { include: { driver: { include: { user: true } } } } },
    });
  },

  update(id: string, data: Prisma.QrCodeUpdateInput) {
    return prisma.qrCode.update({ where: { id }, data });
  },

  markStatus(id: string, status: QrStatus) {
    return prisma.qrCode.update({ where: { id }, data: { status } });
  },
};
