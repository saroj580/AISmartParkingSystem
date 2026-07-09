import pino from "pino";
import { env, isProduction } from "@/lib/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "smart-parking-api" },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
    ],
    censor: "[REDACTED]",
  },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss.l", ignore: "pid,hostname" },
      },
});

export function createModuleLogger(module: string) {
  return logger.child({ module });
}
