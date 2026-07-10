import { z } from "zod";
import { AREA_CATEGORIES, AREA_SORTABLE_FIELDS } from "./area.constants";
import { isValidPolygonWkt } from "../../lib/wkt";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const areaBodySchema = z.object({
  areaName: z.string({ required_error: "Area name is required" }).trim().min(1, "Area name is required"),
  siteId: z.preprocess(
    emptyToUndefined,
    z.string({ required_error: "Site is required", invalid_type_error: "Site is required" }).min(1, "Site is required")
  ),
  category: z.preprocess(
    emptyToUndefined,
    z.enum(AREA_CATEGORIES, { required_error: "Category is required", invalid_type_error: "Category is required" })
  ),
  polygonCoordinates: z
    .string({ required_error: "Input the correct Latitude and Longitude" })
    .trim()
    .min(1, "Input the correct Latitude and Longitude")
    .refine(isValidPolygonWkt, "Input the correct Latitude and Longitude"),
  isActive: z.boolean().optional(),
});

export const areaListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  siteId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(AREA_SORTABLE_FIELDS).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
