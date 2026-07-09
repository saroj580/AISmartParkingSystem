import { z } from "zod";
import { BookingStatus } from "@prisma/client";

export const createBookingSchema = z
  .object({
    spaceId: z.string().min(1),
    vehicleId: z.string().min(1),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  })
  .refine((data) => data.startTime.getTime() >= Date.now() - 60_000, {
    message: "startTime cannot be in the past",
    path: ["startTime"],
  })
  .refine((data) => data.endTime.getTime() - data.startTime.getTime() <= 30 * 24 * 60 * 60 * 1000, {
    message: "Bookings cannot exceed 30 days",
    path: ["endTime"],
  })
  .refine((data) => data.endTime.getTime() - data.startTime.getTime() >= 15 * 60 * 1000, {
    message: "Bookings must be at least 15 minutes long",
    path: ["endTime"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export const listBookingsQuerySchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
