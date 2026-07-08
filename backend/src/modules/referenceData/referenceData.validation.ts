import { z } from "zod";

export function buildReferenceDataBodySchema(entityLabel: string) {
  return z.object({
    name: z.string({ required_error: `${entityLabel} name is required` }).trim().min(1, `${entityLabel} name is required`),
    isActive: z.boolean().optional(),
  });
}

export const referenceDataListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(["name", "createdAt"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
