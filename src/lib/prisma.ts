import { PrismaClient } from "@prisma/client";
import { env, isProduction } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    datasourceUrl: env.DATABASE_URL,
  });

if (!isProduction) {
  globalForPrisma.__prisma = prisma;
}

export type { Prisma } from "@prisma/client";
