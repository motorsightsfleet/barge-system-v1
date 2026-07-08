import { z } from "zod";
import { VARIANT_SPEC_SORTABLE_FIELDS } from "./variantSpecification.constants";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

function requiredId(fieldLabel: string) {
  return z.preprocess(
    emptyToUndefined,
    z.string({ required_error: `${fieldLabel} is required`, invalid_type_error: `${fieldLabel} is required` }).min(
      1,
      `${fieldLabel} is required`
    )
  );
}

export const variantSpecificationBodySchema = z.object({
  unitTypeId: requiredId("Unit type"),
  unitModelId: requiredId("Unit model"),
  unitModelVariantId: requiredId("Unit model variant"),
  engineId: requiredId("Engine"),
  capacityVessel: z
    .number({ required_error: "Capacity vessel is required", invalid_type_error: "Capacity vessel is required" })
    .positive("Capacity vessel must be greater than 0"),
  axleConfiguration: z
    .string({ required_error: "Axle configuration is required" })
    .trim()
    .min(1, "Axle configuration is required"),
  totalWheel: z
    .number({ required_error: "Total wheel is required", invalid_type_error: "Total wheel is required" })
    .int("Total wheel must be a whole number")
    .min(0, "Total wheel cannot be negative"),
  wheelSize: z
    .number({ required_error: "Wheel size is required", invalid_type_error: "Wheel size is required" })
    .min(0, "Wheel size cannot be negative"),
  isActive: z.boolean().optional(),
});

export const variantSpecificationListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  unitTypeId: z.string().optional(),
  unitModelId: z.string().optional(),
  engineId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(VARIANT_SPEC_SORTABLE_FIELDS).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
