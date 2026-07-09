import type { BookingStatus, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaginationResult } from "@/helpers/pagination";

type TxClient = Prisma.TransactionClient | PrismaClient;

export interface LockedSpaceRow {
  id: string;
  lotId: string;
  zoneId: string;
  code: string;
  vehicleType: string;
  status: string;
  isActive: boolean;
}

export const bookingsRepository = {
  /** Locks the parking-space row for the duration of the surrounding transaction (SELECT ... FOR UPDATE). */
  lockSpaceForUpdate(tx: TxClient, spaceId: string) {
    return tx.$queryRaw<LockedSpaceRow[]>`
      SELECT id, "lotId", "zoneId", code, "vehicleType", status, "isActive"
      FROM parking_spaces
      WHERE id = ${spaceId}
      FOR UPDATE
    `;
  },

  findOverlapping(tx: TxClient, spaceId: string, startTime: Date, endTime: Date) {
    return tx.booking.findFirst({
      where: {
        spaceId,
        status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
  },

  create(tx: TxClient, data: Prisma.BookingUncheckedCreateInput) {
    return tx.booking.create({ data });
  },

  updateSpaceStatus(tx: TxClient, spaceId: string, status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE") {
    return tx.parkingSpace.update({ where: { id: spaceId }, data: { status } });
  },

  findByIdWithRelations(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: true,
        space: true,
        lot: true,
        driver: { include: { user: true } },
        payment: true,
        qrCode: true,
      },
    });
  },

  update(id: string, data: Prisma.BookingUpdateInput) {
    return prisma.booking.update({ where: { id }, data });
  },

  async listForDriver(driverId: string, filters: { status?: BookingStatus }, pagination: PaginationResult) {
    const where: Prisma.BookingWhereInput = { driverId, ...(filters.status ? { status: filters.status } : {}) };
    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, space: true, lot: true },
      }),
      prisma.booking.count({ where }),
    ]);
    return { items, total };
  },

  async listForOperator(operatorId: string, filters: { status?: BookingStatus }, pagination: PaginationResult) {
    const where: Prisma.BookingWhereInput = {
      lot: { operatorId },
      ...(filters.status ? { status: filters.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
        include: { vehicle: true, space: true, lot: true, driver: { include: { user: true } } },
      }),
      prisma.booking.count({ where }),
    ]);
    return { items, total };
  },

  findExpiredHolds(now: Date) {
    return prisma.booking.findMany({
      where: { status: "PENDING", holdExpiresAt: { lte: now } },
      include: { driver: { include: { user: true } } },
    });
  },

  findUpcomingForReminders(windowStart: Date, windowEnd: Date) {
    return prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        startTime: { gte: windowStart, lte: windowEnd },
        reminderSentAt: null,
      },
      include: { driver: { include: { user: true } }, lot: true },
    });
  },

  markReminderSent(id: string) {
    return prisma.booking.update({ where: { id }, data: { reminderSentAt: new Date() } });
  },
};
