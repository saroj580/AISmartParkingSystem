import { z } from "zod";
import { VehicleType } from "@prisma/client";

export const createVehicleSchema = z.object({
  plateNumber: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .transform((v) => v.toUpperCase()),
  type: z.nativeEnum(VehicleType),
  make: z.string().trim().max(60).optional(),
  model: z.string().trim().max(60).optional(),
  color: z.string().trim().max(30).optional(),
  isDefault: z.boolean().default(false),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export const updateVehicleSchema = z.object({
  make: z.string().trim().max(60).optional(),
  model: z.string().trim().max(60).optional(),
  color: z.string().trim().max(30).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
