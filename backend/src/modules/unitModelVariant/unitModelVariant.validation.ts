import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const unitModelVariantBodySchema = z.object({
  name: z.string({ required_error: "Unit model variant name is required" }).trim().min(1, "Unit model variant name is required"),
  unitModelId: z.preprocess(
    emptyToUndefined,
    z.string({ required_error: "Unit model is required", invalid_type_error: "Unit model is required" }).min(1, "Unit model is required")
  ),
  isActive: z.boolean().optional(),
});

export const unitModelVariantListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  unitModelId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(["name", "createdAt"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
