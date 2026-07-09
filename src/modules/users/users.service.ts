import type { Role } from "@prisma/client";
import { usersRepository } from "@/modules/users/users.repository";
import type { UpdateProfileInput } from "@/modules/users/users.validators";
import { uploadImageFromBase64 } from "@/lib/cloudinary";
import { NotFoundError } from "@/errors/AppError";
import type { PaginationResult } from "@/helpers/pagination";

function sanitize<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User");
    return sanitize(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await usersRepository.update(userId, input);
    return sanitize(user);
  },

  async uploadAvatar(userId: string, imageBase64: string) {
    const url = await uploadImageFromBase64(imageBase64, "avatars");
    const user = await usersRepository.update(userId, { avatarUrl: url });
    return sanitize(user);
  },

  async adminListUsers(pagination: PaginationResult, filters: { role?: Role; search?: string }) {
    const { items, total } = await usersRepository.list({
      skip: pagination.skip,
      take: pagination.take,
      sortOrder: "desc",
      role: filters.role,
      search: filters.search,
    });
    return { items: items.map(sanitize), total };
  },

  adminGetUser(userId: string) {
    return this.getProfile(userId);
  },

  async adminSetActive(userId: string, isActive: boolean) {
    const user = await usersRepository.setActive(userId, isActive);
    return sanitize(user);
  },
};
