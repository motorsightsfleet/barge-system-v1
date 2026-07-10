import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const engineBodySchema = z.object({
  name: z.string({ required_error: "Engine name is required" }).trim().min(1, "Engine name is required"),
  brandId: z.preprocess(
    emptyToUndefined,
    z.string({ required_error: "Brand is required", invalid_type_error: "Brand is required" }).min(1, "Brand is required")
  ),
  isActive: z.boolean().optional(),
});

export const engineListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  brandId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(["name", "createdAt"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
