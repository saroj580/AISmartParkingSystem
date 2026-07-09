import type { User } from "@prisma/client";
import { authRepository } from "@/modules/auth/auth.repository";
import type { LoginInput, RegisterInput } from "@/modules/auth/auth.validators";
import { hashPassword, verifyPassword } from "@/lib/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";
import { sha256Hex } from "@/lib/hash";
import { durationToSeconds, addSeconds } from "@/helpers/time";
import { env } from "@/lib/env";
import { ConflictError, UnauthorizedError } from "@/errors/AppError";
import { notificationService } from "@/modules/notifications/notifications.service";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("auth-service");

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  refreshTokenExpiresInSeconds: number;
}

function sanitizeUser(user: User) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

async function issueTokensAndSession(user: User, meta: RequestMeta): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const { token: refreshToken, jti } = signRefreshToken(user.id);

  const refreshTokenExpiresInSeconds = durationToSeconds(env.JWT_REFRESH_EXPIRES_IN);
  const accessTokenExpiresInSeconds = durationToSeconds(env.JWT_ACCESS_EXPIRES_IN);

  await authRepository.createSession({
    id: jti,
    userId: user.id,
    refreshTokenHash: sha256Hex(refreshToken),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
    expiresAt: addSeconds(new Date(), refreshTokenExpiresInSeconds),
  });

  return { accessToken, refreshToken, accessTokenExpiresInSeconds, refreshTokenExpiresInSeconds };
}

export const authService = {
  async register(input: RegisterInput, meta: RequestMeta) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUserWithProfile({
      email: input.email,
      phone: input.phone,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      companyName: input.companyName,
    });

    const tokens = await issueTokensAndSession(user, meta);

    notificationService
      .sendWelcomeEmail(user)
      .catch((err) => log.error({ err, userId: user.id }, "Failed to send welcome email"));

    return { user: sanitizeUser(user), tokens };
  },

  async login(input: LoginInput, meta: RequestMeta) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("This account has been deactivated");
    }

    await authRepository.updateLastLogin(user.id);
    const tokens = await issueTokensAndSession(user, meta);

    return { user: sanitizeUser(user), tokens };
  },

  async refresh(refreshToken: string, meta: RequestMeta) {
    const payload = verifyRefreshToken(refreshToken);
    const session = await authRepository.findActiveSessionByHash(sha256Hex(refreshToken));

    if (!session || session.revokedAt || session.expiresAt < new Date() || session.userId !== payload.sub) {
      throw new UnauthorizedError("Refresh token is invalid or has expired");
    }

    // Rotate: revoke the used refresh token immediately to prevent replay.
    await authRepository.revokeSession(session.id);

    const user = await authRepository.findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Account is no longer active");
    }

    const tokens = await issueTokensAndSession(user, meta);
    return { user: sanitizeUser(user), tokens };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const session = await authRepository.findActiveSessionByHash(sha256Hex(refreshToken));
    if (session && !session.revokedAt) {
      await authRepository.revokeSession(session.id);
    }
  },

  async logoutAll(userId: string) {
    await authRepository.revokeAllSessionsForUser(userId);
  },
};
