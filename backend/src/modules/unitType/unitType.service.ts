import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { unitTypeBodySchema, unitTypeListQuerySchema } from "./unitType.validation";

type UnitTypeInput = z.infer<typeof unitTypeBodySchema>;
type UnitTypeListQuery = z.infer<typeof unitTypeListQuerySchema>;

async function assertNameNotTaken(name: string, excludeId?: string) {
  const existing = await prisma.unitType.findFirst({
    where: { name, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict("Unit type name already exists");
}

export async function listUnitTypes(query: UnitTypeListQuery) {
  const { query: search, status, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.UnitTypeWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.unitType.findMany({ where, orderBy: { [sortBy]: sortDir }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.unitType.count({ where }),
  ]);

  return { data, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getUnitTypeById(id: string) {
  const unitType = await prisma.unitType.findFirst({ where: { id, deletedAt: null } });
  if (!unitType) throw AppError.notFound("Unit type not found");
  return unitType;
}

export async function createUnitType(input: UnitTypeInput) {
  const parsed = unitTypeBodySchema.parse(input);
  await assertNameNotTaken(parsed.name);
  return prisma.unitType.create({ data: { name: parsed.name, isActive: parsed.isActive ?? true } });
}

export async function updateUnitType(id: string, input: UnitTypeInput) {
  await getUnitTypeById(id);
  const parsed = unitTypeBodySchema.parse(input);
  await assertNameNotTaken(parsed.name, id);
  return prisma.unitType.update({ where: { id }, data: { name: parsed.name, isActive: parsed.isActive ?? true } });
}

export async function softDeleteUnitType(id: string) {
  await getUnitTypeById(id);
  const count = await prisma.variantSpecification.count({ where: { unitTypeId: id, deletedAt: null } });
  if (count > 0) {
    throw AppError.conflict(`Cannot delete this unit type — it is still used by ${count} variant specification(s)`);
  }
  await prisma.unitType.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listUnitTypesForExport() {
  return prisma.unitType.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}
