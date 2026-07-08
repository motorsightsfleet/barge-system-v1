import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { brandBodySchema, brandListQuerySchema } from "./brand.validation";

type BrandInput = z.infer<typeof brandBodySchema>;
type BrandListQuery = z.infer<typeof brandListQuerySchema>;

async function assertNameNotTaken(name: string, excludeId?: string) {
  const existing = await prisma.brand.findFirst({
    where: { name, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict("Brand name already exists");
}

export async function listBrands(query: BrandListQuery) {
  const { query: search, status, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.BrandWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.brand.findMany({ where, orderBy: { [sortBy]: sortDir }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.brand.count({ where }),
  ]);

  return { data, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getBrandById(id: string) {
  const brand = await prisma.brand.findFirst({ where: { id, deletedAt: null } });
  if (!brand) throw AppError.notFound("Brand not found");
  return brand;
}

export async function createBrand(input: BrandInput) {
  const parsed = brandBodySchema.parse(input);
  await assertNameNotTaken(parsed.name);
  return prisma.brand.create({ data: { name: parsed.name, isActive: parsed.isActive ?? true } });
}

export async function updateBrand(id: string, input: BrandInput) {
  await getBrandById(id);
  const parsed = brandBodySchema.parse(input);
  await assertNameNotTaken(parsed.name, id);
  return prisma.brand.update({ where: { id }, data: { name: parsed.name, isActive: parsed.isActive ?? true } });
}

export async function softDeleteBrand(id: string) {
  await getBrandById(id);
  const engineCount = await prisma.engine.count({ where: { brandId: id, deletedAt: null } });
  if (engineCount > 0) {
    throw AppError.conflict(`Cannot delete this brand — it is still used by ${engineCount} engine(s)`);
  }
  await prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listBrandsForExport() {
  return prisma.brand.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}
