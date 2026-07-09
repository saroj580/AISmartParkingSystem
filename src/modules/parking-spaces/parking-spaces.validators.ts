import { z } from "zod";
import { SpaceStatus, VehicleType } from "@prisma/client";

export const createSpaceSchema = z.object({
  code: z.string().trim().min(1).max(20),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;

export const bulkCreateSpacesSchema = z.object({
  count: z.number().int().min(1).max(500),
  prefix: z.string().trim().min(1).max(10).default("S"),
  startIndex: z.number().int().min(1).default(1),
});

export type BulkCreateSpacesInput = z.infer<typeof bulkCreateSpacesSchema>;

export const updateSpaceSchema = z.object({
  status: z.nativeEnum(SpaceStatus).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;

export const listSpacesQuerySchema = z.object({
  vehicleType: z.nativeEnum(VehicleType).optional(),
  status: z.nativeEnum(SpaceStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
