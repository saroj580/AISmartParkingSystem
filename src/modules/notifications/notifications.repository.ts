import type { NotificationChannel, NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaginationResult } from "@/helpers/pagination";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  subject: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export const notificationsRepository = {
  create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        channel: input.channel ?? "EMAIL",
        subject: input.subject,
        content: input.content,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  },

  markSent(id: string) {
    return prisma.notification.update({ where: { id }, data: { status: "SENT", sentAt: new Date() } });
  },

  markFailed(id: string, error: string) {
    return prisma.notification.update({ where: { id }, data: { status: "FAILED", error } });
  },

  async listForUser(userId: string, pagination: PaginationResult) {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total };
  },
};
