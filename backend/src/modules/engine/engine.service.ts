import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { engineBodySchema, engineListQuerySchema } from "./engine.validation";

type EngineInput = z.infer<typeof engineBodySchema>;
type EngineListQuery = z.infer<typeof engineListQuerySchema>;

async function assertBrandExists(brandId: string) {
  const brand = await prisma.brand.findFirst({ where: { id: brandId, deletedAt: null } });
  if (!brand) throw AppError.badRequest("Brand is required", [{ field: "brandId", message: "Brand is required" }]);
}

async function assertNameNotTaken(name: string, brandId: string, excludeId?: string) {
  const existing = await prisma.engine.findFirst({
    where: { name, brandId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict("Engine name already exists for this brand");
}

export async function listEngines(query: EngineListQuery) {
  const { query: search, status, brandId, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.EngineWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(brandId ? { brandId } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.engine.findMany({
      where,
      include: { brand: true },
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.engine.count({ where }),
  ]);

  return { data, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getEngineById(id: string) {
  const engine = await prisma.engine.findFirst({ where: { id, deletedAt: null }, include: { brand: true } });
  if (!engine) throw AppError.notFound("Engine not found");
  return engine;
}

export async function createEngine(input: EngineInput) {
  const parsed = engineBodySchema.parse(input);
  await assertBrandExists(parsed.brandId);
  await assertNameNotTaken(parsed.name, parsed.brandId);
  return prisma.engine.create({
    data: { name: parsed.name, brandId: parsed.brandId, isActive: parsed.isActive ?? true },
    include: { brand: true },
  });
}

export async function updateEngine(id: string, input: EngineInput) {
  await getEngineById(id);
  const parsed = engineBodySchema.parse(input);
  await assertBrandExists(parsed.brandId);
  await assertNameNotTaken(parsed.name, parsed.brandId, id);
  return prisma.engine.update({
    where: { id },
    data: { name: parsed.name, brandId: parsed.brandId, isActive: parsed.isActive ?? true },
    include: { brand: true },
  });
}

export async function softDeleteEngine(id: string) {
  await getEngineById(id);
  const [specCount, overrideCount] = await Promise.all([
    prisma.variantSpecification.count({ where: { engineId: id, deletedAt: null } }),
    prisma.unit.count({ where: { engineOverrideId: id, deletedAt: null } }),
  ]);
  if (specCount > 0) {
    throw AppError.conflict(`Cannot delete this engine — it is still used by ${specCount} variant specification(s)`);
  }
  if (overrideCount > 0) {
    throw AppError.conflict(`Cannot delete this engine — it is still used as an override by ${overrideCount} unit(s)`);
  }
  await prisma.engine.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listEnginesForExport() {
  return prisma.engine.findMany({ where: { deletedAt: null }, include: { brand: true }, orderBy: { name: "asc" } });
}
