import type { Notification as PrismaNotification } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AppNotification } from "@/types/domain";

/**
 * The schema has no per-user "read" flag — we treat anything created before the
 * user's last login as already seen, which is the same heuristic used for the
 * sidebar/topbar unread badge.
 */
function toNotificationVM(n: PrismaNotification, readBefore: Date): AppNotification {
  return {
    id: n.id,
    type: n.type,
    title: n.subject,
    body: n.content,
    createdAt: n.createdAt.toISOString(),
    read: n.createdAt <= readBefore,
  };
}

export async function listUserNotifications(userId: string): Promise<AppNotification[]> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const readBefore = user.lastLoginAt ?? user.createdAt;

  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return rows.map((n) => toNotificationVM(n, readBefore));
}
