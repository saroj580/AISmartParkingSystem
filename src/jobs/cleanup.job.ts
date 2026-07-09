import { prisma } from "@/lib/prisma";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("job:cleanup");

const SESSION_RETENTION_DAYS = 30;

/** Housekeeping sweep: prunes stale sessions and expires QR codes whose validity window has lapsed. */
export async function cleanupJob() {
  const retentionCutoff = new Date(Date.now() - SESSION_RETENTION_DAYS * 86_400_000);

  const [deletedSessions, expiredQrCodes] = await Promise.all([
    prisma.session.deleteMany({
      where: { OR: [{ revokedAt: { not: null } }, { expiresAt: { lt: new Date() } }], createdAt: { lt: retentionCutoff } },
    }),
    prisma.qrCode.updateMany({
      where: { status: { in: ["ACTIVE", "CHECKED_IN"] }, expiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    }),
  ]);

  log.info(
    { deletedSessions: deletedSessions.count, expiredQrCodes: expiredQrCodes.count },
    "Cleanup job completed"
  );

  return { deletedSessions: deletedSessions.count, expiredQrCodes: expiredQrCodes.count };
}
