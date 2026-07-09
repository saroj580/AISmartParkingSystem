import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: passwordSchema,
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    phone: z.string().trim().min(7).max(20).optional(),
    role: z.enum(["DRIVER", "OPERATOR"]).default("DRIVER"),
    companyName: z.string().trim().min(1).max(120).optional(),
  })
  .refine((data) => data.role !== "OPERATOR" || !!data.companyName, {
    message: "companyName is required when registering as an OPERATOR",
    path: ["companyName"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
