import type { z } from "zod";
import { AppError } from "../../lib/AppError";
import { referenceDataListQuerySchema } from "./referenceData.validation";
import { REFERENCE_DATA_CONFIG } from "./referenceData.config";
import type { ReferenceDataType } from "./referenceData.constants";

type Input = { name: string; isActive?: boolean };
type ListQuery = z.infer<typeof referenceDataListQuerySchema>;

async function assertNameNotTaken(type: ReferenceDataType, name: string, excludeId?: string) {
  const config = REFERENCE_DATA_CONFIG[type];
  const existing = await config.delegate.findFirst({
    where: { name, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict(`${config.entityLabel} name already exists`);
}

export async function list(type: ReferenceDataType, query: ListQuery) {
  const config = REFERENCE_DATA_CONFIG[type];
  const { query: search, status, page, pageSize, sortBy, sortDir } = query;

  const where = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    config.delegate.findMany({ where, orderBy: { [sortBy]: sortDir }, skip: (page - 1) * pageSize, take: pageSize }),
    config.delegate.count({ where }),
  ]);

  return { data, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getById(type: ReferenceDataType, id: string) {
  const config = REFERENCE_DATA_CONFIG[type];
  const entity = await config.delegate.findFirst({ where: { id, deletedAt: null } });
  if (!entity) throw AppError.notFound(`${config.entityLabel} not found`);
  return entity;
}

export async function create(type: ReferenceDataType, input: Input) {
  const config = REFERENCE_DATA_CONFIG[type];
  const parsed = config.bodySchema.parse(input);
  await assertNameNotTaken(type, parsed.name);
  return config.delegate.create({ data: { name: parsed.name, isActive: parsed.isActive ?? true } });
}

export async function update(type: ReferenceDataType, id: string, input: Input) {
  await getById(type, id);
  const config = REFERENCE_DATA_CONFIG[type];
  const parsed = config.bodySchema.parse(input);
  await assertNameNotTaken(type, parsed.name, id);
  return config.delegate.update({ where: { id }, data: { name: parsed.name, isActive: parsed.isActive ?? true } });
}

export async function softDelete(type: ReferenceDataType, id: string) {
  await getById(type, id);
  const config = REFERENCE_DATA_CONFIG[type];
  for (const dependent of config.dependents) {
    const count = await dependent.count(id);
    if (count > 0) {
      throw AppError.conflict(`Cannot delete this ${config.entityLabelLower} — it is still used by ${count} ${dependent.label}`);
    }
  }
  await config.delegate.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listForExport(type: ReferenceDataType) {
  const config = REFERENCE_DATA_CONFIG[type];
  return config.delegate.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}
