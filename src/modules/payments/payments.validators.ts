import { z } from "zod";

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().trim().max(300).optional(),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
