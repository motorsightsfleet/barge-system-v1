import { z } from "zod";
import { SHIFT_SORTABLE_FIELDS } from "./shift.constants";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const shiftBodySchema = z
  .object({
    shiftName: z.string({ required_error: "Shift name is required" }).trim().min(1, "Shift name is required"),
    shiftStart: z
      .string({ required_error: "Shift start is required" })
      .trim()
      .min(1, "Shift start is required")
      .refine((v) => TIME_PATTERN.test(v), "Shift start must be a valid time (HH:mm)"),
    shiftEnd: z
      .string({ required_error: "Shift end is required" })
      .trim()
      .min(1, "Shift end is required")
      .refine((v) => TIME_PATTERN.test(v), "Shift end must be a valid time (HH:mm)"),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.shiftStart !== data.shiftEnd, {
    message: "Start and end time cannot be the same",
    path: ["shiftEnd"],
  });

export const shiftListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(SHIFT_SORTABLE_FIELDS).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
