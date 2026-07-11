import { prisma } from "@/lib/prisma";
import { qrService } from "@/modules/qr/qr.service";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("job:cleanup");

const SESSION_RETENTION_DAYS = 30;

/** Housekeeping sweep: prunes stale sessions and resolves bookings whose QR validity window has lapsed. */
export async function cleanupJob() {
  const retentionCutoff = new Date(Date.now() - SESSION_RETENTION_DAYS * 86_400_000);

  const [deletedSessions, lapsedQrCodes] = await Promise.all([
    prisma.session.deleteMany({
      where: { OR: [{ revokedAt: { not: null } }, { expiresAt: { lt: new Date() } }], createdAt: { lt: retentionCutoff } },
    }),
    qrService.releaseLapsedCodes(),
  ]);

  log.info(
    { deletedSessions: deletedSessions.count, ...lapsedQrCodes },
    "Cleanup job completed"
  );

  return { deletedSessions: deletedSessions.count, ...lapsedQrCodes };
}
