import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { areaBodySchema, areaListQuerySchema } from "./area.validation";

type AreaInput = z.infer<typeof areaBodySchema>;
type AreaListQuery = z.infer<typeof areaListQuerySchema>;

async function assertSiteExists(siteId: string) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) throw AppError.badRequest("Site is required", [{ field: "siteId", message: "Site is required" }]);
  return site;
}

async function assertNameNotTaken(areaName: string, siteId: string, excludeId?: string) {
  const existing = await prisma.area.findFirst({
    where: { areaName, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict("Area name already exists in this site");
}

function buildOrderBy(sortBy: AreaListQuery["sortBy"], sortDir: AreaListQuery["sortDir"]): Prisma.AreaOrderByWithRelationInput {
  if (sortBy === "site") return { site: { name: sortDir } };
  return { [sortBy]: sortDir };
}

export async function listAreas(query: AreaListQuery) {
  const { query: search, status, siteId, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.AreaWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(siteId ? { siteId } : {}),
    ...(search ? { areaName: { contains: search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.area.findMany({
      where,
      include: { site: true },
      orderBy: buildOrderBy(sortBy, sortDir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.area.count({ where }),
  ]);

  return {
    data,
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function getAreaById(id: string) {
  const area = await prisma.area.findFirst({ where: { id, deletedAt: null }, include: { site: true } });
  if (!area) throw AppError.notFound("Area not found");
  return area;
}

export async function createArea(input: AreaInput) {
  const parsed = areaBodySchema.parse(input);
  await assertSiteExists(parsed.siteId);
  await assertNameNotTaken(parsed.areaName, parsed.siteId);

  return prisma.area.create({
    data: {
      areaName: parsed.areaName,
      siteId: parsed.siteId,
      category: parsed.category,
      polygonCoordinates: parsed.polygonCoordinates,
      isActive: parsed.isActive ?? true,
    },
    include: { site: true },
  });
}

export async function updateArea(id: string, input: AreaInput) {
  await getAreaById(id);
  const parsed = areaBodySchema.parse(input);
  await assertSiteExists(parsed.siteId);
  await assertNameNotTaken(parsed.areaName, parsed.siteId, id);

  return prisma.area.update({
    where: { id },
    data: {
      areaName: parsed.areaName,
      siteId: parsed.siteId,
      category: parsed.category,
      polygonCoordinates: parsed.polygonCoordinates,
      isActive: parsed.isActive ?? true,
    },
    include: { site: true },
  });
}

export async function softDeleteArea(id: string) {
  await getAreaById(id);
  await prisma.area.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listAreasForExport() {
  return prisma.area.findMany({
    where: { deletedAt: null },
    include: { site: true },
    orderBy: { areaName: "asc" },
  });
}
