import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { AppError } from "@/errors/AppError";
import { fail } from "@/helpers/apiResponse";
import { createModuleLogger } from "@/lib/logger";
import { isProduction } from "@/lib/env";
import type { RouteContext, RouteHandler } from "@/types/api";

const log = createModuleLogger("error-handler");

function handlePrismaError(err: Prisma.PrismaClientKnownRequestError) {
  switch (err.code) {
    case "P2002": {
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return fail("CONFLICT", `A record with this ${target} already exists`, 409);
    }
    case "P2025":
      return fail("NOT_FOUND", "Requested record was not found", 404);
    case "P2003":
      return fail("BAD_REQUEST", "Referenced record does not exist", 400);
    default:
      return fail("DATABASE_ERROR", "A database error occurred", 500);
  }
}

/** Wraps a Next.js route handler so every module gets uniform error → HTTP response mapping. */
export function withErrorHandling<P extends Record<string, string | string[]> = Record<string, string>>(
  handler: RouteHandler<P>
): RouteHandler<P> {
  return async (req: NextRequest, ctx: RouteContext<P>) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AppError) {
        return fail(err.code, err.message, err.statusCode, err.details);
      }

      if (err instanceof ZodError) {
        return fail("VALIDATION_ERROR", "Validation failed", 422, err.flatten());
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        return handlePrismaError(err);
      }

      log.error({ err, url: req.url, method: req.method }, "Unhandled error in route handler");

      return fail(
        "INTERNAL_SERVER_ERROR",
        isProduction ? "Something went wrong" : (err as Error).message,
        500
      );
    }
  };
}
