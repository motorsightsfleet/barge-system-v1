import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { unitModelVariantBodySchema, unitModelVariantListQuerySchema } from "./unitModelVariant.validation";

type UnitModelVariantInput = z.infer<typeof unitModelVariantBodySchema>;
type UnitModelVariantListQuery = z.infer<typeof unitModelVariantListQuerySchema>;

async function assertUnitModelExists(unitModelId: string) {
  const unitModel = await prisma.unitModel.findFirst({ where: { id: unitModelId, deletedAt: null } });
  if (!unitModel) throw AppError.badRequest("Unit model is required", [{ field: "unitModelId", message: "Unit model is required" }]);
}

async function assertNameNotTaken(name: string, unitModelId: string, excludeId?: string) {
  const existing = await prisma.unitModelVariant.findFirst({
    where: { name, unitModelId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict("Unit model variant name already exists for this unit model");
}

export async function listUnitModelVariants(query: UnitModelVariantListQuery) {
  const { query: search, status, unitModelId, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.UnitModelVariantWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(unitModelId ? { unitModelId } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.unitModelVariant.findMany({
      where,
      include: { unitModel: true },
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.unitModelVariant.count({ where }),
  ]);

  return { data, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getUnitModelVariantById(id: string) {
  const variant = await prisma.unitModelVariant.findFirst({ where: { id, deletedAt: null }, include: { unitModel: true } });
  if (!variant) throw AppError.notFound("Unit model variant not found");
  return variant;
}

export async function createUnitModelVariant(input: UnitModelVariantInput) {
  const parsed = unitModelVariantBodySchema.parse(input);
  await assertUnitModelExists(parsed.unitModelId);
  await assertNameNotTaken(parsed.name, parsed.unitModelId);
  return prisma.unitModelVariant.create({
    data: { name: parsed.name, unitModelId: parsed.unitModelId, isActive: parsed.isActive ?? true },
    include: { unitModel: true },
  });
}

export async function updateUnitModelVariant(id: string, input: UnitModelVariantInput) {
  await getUnitModelVariantById(id);
  const parsed = unitModelVariantBodySchema.parse(input);
  await assertUnitModelExists(parsed.unitModelId);
  await assertNameNotTaken(parsed.name, parsed.unitModelId, id);
  return prisma.unitModelVariant.update({
    where: { id },
    data: { name: parsed.name, unitModelId: parsed.unitModelId, isActive: parsed.isActive ?? true },
    include: { unitModel: true },
  });
}

export async function softDeleteUnitModelVariant(id: string) {
  await getUnitModelVariantById(id);
  const specCount = await prisma.variantSpecification.count({ where: { unitModelVariantId: id, deletedAt: null } });
  if (specCount > 0) {
    throw AppError.conflict(`Cannot delete this unit model variant — it is still used by ${specCount} variant specification(s)`);
  }
  await prisma.unitModelVariant.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listUnitModelVariantsForExport() {
  return prisma.unitModelVariant.findMany({ where: { deletedAt: null }, include: { unitModel: true }, orderBy: { name: "asc" } });
}
