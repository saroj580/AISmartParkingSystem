import { Resend } from "resend";
import { env } from "@/lib/env";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("resend");

const globalForResend = globalThis as unknown as { __resend?: Resend };

export const resendClient =
  globalForResend.__resend ?? new Resend(env.RESEND_API_KEY || "re_disabled_placeholder");

if (env.NODE_ENV !== "production") {
  globalForResend.__resend = resendClient;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ id?: string }> {
  if (!env.RESEND_API_KEY) {
    log.warn({ to, subject }, "RESEND_API_KEY not configured — skipping email send");
    return {};
  }

  const { data, error } = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    log.error({ err: error, to, subject }, "Failed to send email");
    throw new Error(`Email send failed: ${error.message}`);
  }

  return { id: data?.id };
}
