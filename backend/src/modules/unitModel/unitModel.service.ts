import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { unitModelBodySchema, unitModelListQuerySchema } from "./unitModel.validation";

type UnitModelInput = z.infer<typeof unitModelBodySchema>;
type UnitModelListQuery = z.infer<typeof unitModelListQuerySchema>;

async function assertNameNotTaken(name: string, excludeId?: string) {
  const existing = await prisma.unitModel.findFirst({
    where: { name, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict("Unit model name already exists");
}

export async function listUnitModels(query: UnitModelListQuery) {
  const { query: search, status, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.UnitModelWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.unitModel.findMany({ where, orderBy: { [sortBy]: sortDir }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.unitModel.count({ where }),
  ]);

  return { data, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getUnitModelById(id: string) {
  const unitModel = await prisma.unitModel.findFirst({ where: { id, deletedAt: null } });
  if (!unitModel) throw AppError.notFound("Unit model not found");
  return unitModel;
}

export async function createUnitModel(input: UnitModelInput) {
  const parsed = unitModelBodySchema.parse(input);
  await assertNameNotTaken(parsed.name);
  return prisma.unitModel.create({ data: { name: parsed.name, isActive: parsed.isActive ?? true } });
}

export async function updateUnitModel(id: string, input: UnitModelInput) {
  await getUnitModelById(id);
  const parsed = unitModelBodySchema.parse(input);
  await assertNameNotTaken(parsed.name, id);
  return prisma.unitModel.update({ where: { id }, data: { name: parsed.name, isActive: parsed.isActive ?? true } });
}

export async function softDeleteUnitModel(id: string) {
  await getUnitModelById(id);
  const [variantCount, specCount] = await Promise.all([
    prisma.unitModelVariant.count({ where: { unitModelId: id, deletedAt: null } }),
    prisma.variantSpecification.count({ where: { unitModelId: id, deletedAt: null } }),
  ]);
  if (variantCount > 0) {
    throw AppError.conflict(`Cannot delete this unit model — it is still used by ${variantCount} unit model variant(s)`);
  }
  if (specCount > 0) {
    throw AppError.conflict(`Cannot delete this unit model — it is still used by ${specCount} variant specification(s)`);
  }
  await prisma.unitModel.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listUnitModelsForExport() {
  return prisma.unitModel.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}
