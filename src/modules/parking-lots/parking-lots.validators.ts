import { z } from "zod";
import { LotStatus, VehicleType } from "@prisma/client";

export const createLotSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  addressLine: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).default("00:00"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).default("23:59"),
  amenities: z.array(z.string().trim().max(60)).default([]),
  images: z.array(z.string().url()).default([]),
});

export type CreateLotInput = z.infer<typeof createLotSchema>;

export const updateLotSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  addressLine: z.string().trim().min(1).max(200).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().min(1).max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  status: z.nativeEnum(LotStatus).optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  amenities: z.array(z.string().trim().max(60)).optional(),
  images: z.array(z.string().url()).optional(),
});

export type UpdateLotInput = z.infer<typeof updateLotSchema>;

export const nearbySearchQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(100).default(5),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type NearbySearchQuery = z.infer<typeof nearbySearchQuerySchema>;
