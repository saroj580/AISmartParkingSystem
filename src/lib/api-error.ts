/**
 * Zod validation failures come back from the API as
 * { success: false, error: { code: "VALIDATION_ERROR", message: "Validation failed", details: <zod flatten()> } }.
 * The top-level message is generic — pull out the first concrete field error when present.
 */
export function apiErrorMessage(json: unknown, fallback: string): string {
  const error = (json as { error?: { message?: string; details?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } } })
    ?.error;
  if (!error) return fallback;

  const fieldError = Object.values(error.details?.fieldErrors ?? {}).find((msgs) => msgs?.length)?.[0];
  return fieldError ?? error.details?.formErrors?.[0] ?? error.message ?? fallback;
}
