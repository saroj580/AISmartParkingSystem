import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  bookingId: z.string().min(1),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().trim().max(300).optional(),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
