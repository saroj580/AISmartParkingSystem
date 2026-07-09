import { operatorsRepository } from "@/modules/operators/operators.repository";
import type { UpdateOperatorProfileInput } from "@/modules/operators/operators.validators";
import { NotFoundError } from "@/errors/AppError";
import type { PaginationResult } from "@/helpers/pagination";

function sanitize<T extends { user: { passwordHash: string } }>(profile: T) {
  const { user, ...rest } = profile;
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { ...rest, user: safeUser };
}

export const operatorsService = {
  async getMyProfile(userId: string) {
    const profile = await operatorsRepository.findByUserId(userId);
    if (!profile) throw new NotFoundError("Operator profile");
    return sanitize(profile);
  },

  async updateMyProfile(userId: string, input: UpdateOperatorProfileInput) {
    const profile = await operatorsRepository.update(userId, input);
    return this.getMyProfile(profile.userId);
  },

  async getById(id: string) {
    const profile = await operatorsRepository.findById(id);
    if (!profile) throw new NotFoundError("Operator profile");
    return sanitize(profile);
  },

  async setVerified(id: string, isVerified: boolean) {
    await operatorsRepository.setVerified(id, isVerified);
    return this.getById(id);
  },

  async list(pagination: PaginationResult) {
    const { items, total } = await operatorsRepository.list(pagination);
    return { items: items.map(sanitize), total };
  },
};
