import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface CreateUserWithProfileInput {
  email: string;
  phone?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyName?: string;
}

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async createUserWithProfile(input: CreateUserWithProfileInput) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          phone: input.phone,
          passwordHash: input.passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
        },
      });

      if (input.role === "DRIVER") {
        await tx.driverProfile.create({ data: { userId: user.id } });
      } else if (input.role === "OPERATOR") {
        await tx.operatorProfile.create({
          data: { userId: user.id, companyName: input.companyName ?? `${input.firstName}'s Lots` },
        });
      }

      return user;
    });
  },

  updateLastLogin(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  },

  createSession(data: Prisma.SessionUncheckedCreateInput) {
    return prisma.session.create({ data });
  },

  findActiveSessionByHash(refreshTokenHash: string) {
    return prisma.session.findUnique({ where: { refreshTokenHash } });
  },

  revokeSession(id: string) {
    return prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  revokeAllSessionsForUser(userId: string) {
    return prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
