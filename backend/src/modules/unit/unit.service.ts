import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { unitBodySchema, unitListQuerySchema } from "./unit.validation";
import { buildVariantSpecLabel } from "../variantSpecification/variantSpecification.constants";

type UnitInput = z.infer<typeof unitBodySchema>;
type UnitListQuery = z.infer<typeof unitListQuerySchema>;

const INCLUDE = {
  site: true,
  variantSpecification: {
    include: {
      unitType: true,
      unitModel: true,
      unitModelVariant: true,
      engine: { include: { brand: true } },
    },
  },
  engineOverride: { include: { brand: true } },
} satisfies Prisma.UnitInclude;

type UnitWithRelations = Prisma.UnitGetPayload<{ include: typeof INCLUDE }>;

function withResolvedSpecification(unit: UnitWithRelations) {
  const spec = unit.variantSpecification;
  const effectiveEngine = unit.engineOverride ?? spec.engine;
  const effectiveCapacityVessel = unit.capacityVesselOverride ?? spec.capacityVessel;
  const effectiveAxleConfiguration = unit.axleConfigurationOverride ?? spec.axleConfiguration;
  const effectiveTotalWheel = unit.totalWheelOverride ?? spec.totalWheel;
  const effectiveWheelSize = unit.wheelSizeOverride ?? spec.wheelSize;

  return {
    ...unit,
    variantSpecification: {
      ...spec,
      label: buildVariantSpecLabel({
        unitTypeName: spec.unitType.name,
        unitModelName: spec.unitModel.name,
        unitModelVariantName: spec.unitModelVariant.name,
        engineName: spec.engine.name,
        axleConfiguration: spec.axleConfiguration,
      }),
    },
    resolvedSpecification: {
      engine: effectiveEngine,
      capacityVessel: effectiveCapacityVessel,
      axleConfiguration: effectiveAxleConfiguration,
      totalWheel: effectiveTotalWheel,
      wheelSize: effectiveWheelSize,
      isOverridden: {
        engine: unit.engineOverrideId !== null,
        capacityVessel: unit.capacityVesselOverride !== null,
        axleConfiguration: unit.axleConfigurationOverride !== null,
        totalWheel: unit.totalWheelOverride !== null,
        wheelSize: unit.wheelSizeOverride !== null,
      },
    },
  };
}

async function assertSiteExists(siteId: string) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) throw AppError.badRequest("Site is required", [{ field: "siteId", message: "Site is required" }]);
}

async function assertVariantSpecificationExists(variantSpecificationId: string) {
  const spec = await prisma.variantSpecification.findFirst({ where: { id: variantSpecificationId, deletedAt: null } });
  if (!spec) {
    throw AppError.badRequest("Variant specification is required", [
      { field: "variantSpecificationId", message: "Variant specification is required" },
    ]);
  }
}

async function assertEngineOverrideExists(engineOverrideId: string | null | undefined) {
  if (!engineOverrideId) return;
  const engine = await prisma.engine.findFirst({ where: { id: engineOverrideId, deletedAt: null } });
  if (!engine) {
    throw AppError.badRequest("Selected override engine is invalid", [
      { field: "engineOverrideId", message: "Selected override engine is invalid" },
    ]);
  }
}

async function assertUnitCodeNotTaken(unitCode: string, excludeId?: string) {
  const existing = await prisma.unit.findFirst({
    where: { unitCode, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict("Unit code already exists");
}

function buildOrderBy(sortBy: UnitListQuery["sortBy"], sortDir: UnitListQuery["sortDir"]): Prisma.UnitOrderByWithRelationInput {
  if (sortBy === "unitType") return { variantSpecification: { unitType: { name: sortDir } } };
  if (sortBy === "site") return { site: { name: sortDir } };
  return { [sortBy]: sortDir };
}

export async function listUnits(query: UnitListQuery) {
  const { query: search, status, siteId, unitStatus, arriveDateFrom, arriveDateTo, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.UnitWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(siteId ? { siteId } : {}),
    ...(unitStatus ? { unitStatus } : {}),
    ...(arriveDateFrom || arriveDateTo
      ? {
          arriveDate: {
            ...(arriveDateFrom ? { gte: arriveDateFrom } : {}),
            ...(arriveDateTo ? { lte: arriveDateTo } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { unitCode: { contains: search, mode: "insensitive" } },
            { serialNumber: { contains: search, mode: "insensitive" } },
            { variantSpecification: { unitType: { name: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      include: INCLUDE,
      orderBy: buildOrderBy(sortBy, sortDir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.unit.count({ where }),
  ]);

  return {
    data: data.map(withResolvedSpecification),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function getUnitById(id: string) {
  const unit = await prisma.unit.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
  if (!unit) throw AppError.notFound("Unit not found");
  return withResolvedSpecification(unit);
}

export async function createUnit(input: UnitInput) {
  const parsed = unitBodySchema.parse(input);
  await assertSiteExists(parsed.siteId);
  await assertVariantSpecificationExists(parsed.variantSpecificationId);
  await assertEngineOverrideExists(parsed.engineOverrideId);
  await assertUnitCodeNotTaken(parsed.unitCode);

  const created = await prisma.unit.create({
    data: {
      unitCode: parsed.unitCode,
      siteId: parsed.siteId,
      variantSpecificationId: parsed.variantSpecificationId,
      unitStatus: parsed.unitStatus,
      serialNumber: parsed.serialNumber,
      arriveDate: new Date(parsed.arriveDate),
      isActive: parsed.isActive ?? true,
      engineOverrideId: parsed.engineOverrideId ?? null,
      capacityVesselOverride: parsed.capacityVesselOverride ?? null,
      axleConfigurationOverride: parsed.axleConfigurationOverride ?? null,
      totalWheelOverride: parsed.totalWheelOverride ?? null,
      wheelSizeOverride: parsed.wheelSizeOverride ?? null,
    },
    include: INCLUDE,
  });
  return withResolvedSpecification(created);
}

export async function updateUnit(id: string, input: UnitInput) {
  await getUnitById(id);
  const parsed = unitBodySchema.parse(input);
  await assertSiteExists(parsed.siteId);
  await assertVariantSpecificationExists(parsed.variantSpecificationId);
  await assertEngineOverrideExists(parsed.engineOverrideId);
  await assertUnitCodeNotTaken(parsed.unitCode, id);

  const updated = await prisma.unit.update({
    where: { id },
    data: {
      unitCode: parsed.unitCode,
      siteId: parsed.siteId,
      variantSpecificationId: parsed.variantSpecificationId,
      unitStatus: parsed.unitStatus,
      serialNumber: parsed.serialNumber,
      arriveDate: new Date(parsed.arriveDate),
      isActive: parsed.isActive ?? true,
      engineOverrideId: parsed.engineOverrideId ?? null,
      capacityVesselOverride: parsed.capacityVesselOverride ?? null,
      axleConfigurationOverride: parsed.axleConfigurationOverride ?? null,
      totalWheelOverride: parsed.totalWheelOverride ?? null,
      wheelSizeOverride: parsed.wheelSizeOverride ?? null,
    },
    include: INCLUDE,
  });
  return withResolvedSpecification(updated);
}

export async function softDeleteUnit(id: string) {
  await getUnitById(id);
  await prisma.unit.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listUnitsForExport() {
  const units = await prisma.unit.findMany({ where: { deletedAt: null }, include: INCLUDE, orderBy: { unitCode: "asc" } });
  return units.map(withResolvedSpecification);
}
