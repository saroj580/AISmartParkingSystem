import { z } from "zod";
import { VehicleType } from "@prisma/client";

export const createZoneSchema = z.object({
  name: z.string().trim().min(1).max(60),
  vehicleType: z.nativeEnum(VehicleType),
  floor: z.string().trim().max(30).optional(),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;

export const updateZoneSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  floor: z.string().trim().max(30).optional(),
});

export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;
