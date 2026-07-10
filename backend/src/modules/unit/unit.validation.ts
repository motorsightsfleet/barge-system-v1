import { z } from "zod";
import { UNIT_SORTABLE_FIELDS, UNIT_STATUSES } from "./unit.constants";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);
const emptyToNull = (val: unknown) => (val === "" || val === undefined ? null : val);

function requiredId(fieldLabel: string) {
  return z.preprocess(
    emptyToUndefined,
    z.string({ required_error: `${fieldLabel} is required`, invalid_type_error: `${fieldLabel} is required` }).min(
      1,
      `${fieldLabel} is required`
    )
  );
}

export const unitBodySchema = z.object({
  unitCode: z.string({ required_error: "Unit code is required" }).trim().min(1, "Unit code is required"),
  siteId: requiredId("Site"),
  variantSpecificationId: requiredId("Variant specification"),
  unitStatus: z.preprocess(
    emptyToUndefined,
    z.enum(UNIT_STATUSES, { required_error: "Unit status is required", invalid_type_error: "Unit status is required" })
  ),
  serialNumber: z.string({ required_error: "Serial number is required" }).trim().min(1, "Serial number is required"),
  arriveDate: z.preprocess(
    emptyToUndefined,
    z
      .string({ required_error: "Arrive date is required", invalid_type_error: "Arrive date is required" })
      .min(1, "Arrive date is required")
      .refine((v) => !isNaN(new Date(v).getTime()), "Arrive date must be a valid date")
  ),
  isActive: z.boolean().optional(),

  // Per-unit overrides — only meaningful when the user opens "Edit Specification".
  // Sent as null/omitted to clear an override back to the variant specification's base value.
  engineOverrideId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  capacityVesselOverride: z.preprocess(emptyToNull, z.number().positive("Capacity vessel must be greater than 0").nullable().optional()),
  axleConfigurationOverride: z.preprocess(emptyToNull, z.string().nullable().optional()),
  totalWheelOverride: z.preprocess(emptyToNull, z.number().int().min(0, "Total wheel cannot be negative").nullable().optional()),
  wheelSizeOverride: z.preprocess(emptyToNull, z.number().min(0, "Wheel size cannot be negative").nullable().optional()),
});

export const unitListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  siteId: z.string().optional(),
  unitStatus: z.enum(UNIT_STATUSES).optional(),
  arriveDateFrom: z.coerce.date().optional(),
  arriveDateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(UNIT_SORTABLE_FIELDS).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
