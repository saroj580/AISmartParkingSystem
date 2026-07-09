import type { NextRequest } from "next/server";
import type { ZodType } from "zod";
import { BadRequestError } from "@/errors/AppError";

export async function validateBody<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new BadRequestError("Request body must be valid JSON");
  }
  return schema.parse(json);
}

export function validateQuery<T>(url: URL, schema: ZodType<T>): T {
  return schema.parse(Object.fromEntries(url.searchParams.entries()));
}
