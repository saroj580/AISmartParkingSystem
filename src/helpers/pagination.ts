import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().trim().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function resolvePagination(query: { page: number; limit: number }): PaginationResult {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/** Parses `?page=&limit=&sortBy=&sortOrder=&search=` from a request URL's search params. */
export function parsePaginationFromUrl(url: URL): PaginationQuery {
  return paginationQuerySchema.parse({
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    sortBy: url.searchParams.get("sortBy") ?? undefined,
    sortOrder: url.searchParams.get("sortOrder") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });
}
