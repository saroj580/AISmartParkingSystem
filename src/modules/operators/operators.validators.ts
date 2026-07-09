import { z } from "zod";

export const updateOperatorProfileSchema = z.object({
  companyName: z.string().trim().min(1).max(120).optional(),
  businessLicense: z.string().trim().min(1).max(120).optional(),
});

export type UpdateOperatorProfileInput = z.infer<typeof updateOperatorProfileSchema>;

export const verifyOperatorSchema = z.object({
  isVerified: z.boolean(),
});
