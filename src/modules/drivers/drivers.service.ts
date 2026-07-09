import { driversRepository } from "@/modules/drivers/drivers.repository";
import { NotFoundError } from "@/errors/AppError";
import type { PaginationResult } from "@/helpers/pagination";

function sanitize<T extends { user: { passwordHash: string } }>(profile: T) {
  const { user, ...rest } = profile;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { ...rest, user: safeUser };
}

export const driversService = {
  async getMyProfile(userId: string) {
    const profile = await driversRepository.findByUserId(userId);
    if (!profile) throw new NotFoundError("Driver profile");
    return sanitize(profile);
  },

  async list(pagination: PaginationResult) {
    const { items, total } = await driversRepository.list(pagination);
    return { items: items.map(sanitize), total };
  },
};
