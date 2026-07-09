import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  phone: z.string().trim().min(7).max(20).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const uploadAvatarSchema = z.object({
  imageBase64: z.string().min(1, "imageBase64 (data URI) is required"),
});

export const userStatusSchema = z.object({
  isActive: z.boolean(),
});

export const adminListUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(["DRIVER", "OPERATOR", "ADMIN"]).optional(),
  search: z.string().trim().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
