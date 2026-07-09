import { z } from "zod";

export const scanQrSchema = z.object({
  code: z.string().min(1, "QR code payload is required"),
});

export type ScanQrInput = z.infer<typeof scanQrSchema>;
