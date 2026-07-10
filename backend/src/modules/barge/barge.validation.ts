import { z } from "zod";
import { BARGE_SORTABLE_FIELDS, BARGE_STATUSES, BARGE_TYPES } from "./barge.constants";

export const bargeBodySchema = z.object({
  name: z.string({ required_error: "Barge name is required" }).trim().min(1, "Barge name is required"),
  owner: z.string({ required_error: "Barge owner is required" }).trim().min(1, "Barge owner is required"),
  capacityMt: z
    .number({ required_error: "Barge capacity is required", invalid_type_error: "Barge capacity is required" })
    .int("Barge capacity must be a whole number")
    .positive("Barge capacity is required"),
  type: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(BARGE_TYPES, { required_error: "Barge type is required", invalid_type_error: "Barge type is required" })
  ),
  status: z.enum(BARGE_STATUSES).optional(),
});

export const bargeListQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(BARGE_STATUSES).optional(),
  type: z.enum(BARGE_TYPES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(BARGE_SORTABLE_FIELDS).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});
