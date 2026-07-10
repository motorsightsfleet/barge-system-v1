import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import {
  variantSpecificationBodySchema,
  variantSpecificationListQuerySchema,
} from "./variantSpecification.validation";
import { buildVariantSpecLabel } from "./variantSpecification.constants";

type VariantSpecInput = z.infer<typeof variantSpecificationBodySchema>;
type VariantSpecListQuery = z.infer<typeof variantSpecificationListQuerySchema>;

const INCLUDE = {
  unitType: true,
  unitModel: true,
  unitModelVariant: true,
  engine: { include: { brand: true } },
} satisfies Prisma.VariantSpecificationInclude;

type VariantSpecWithRelations = Prisma.VariantSpecificationGetPayload<{ include: typeof INCLUDE }>;

function withLabel(spec: VariantSpecWithRelations) {
  return {
    ...spec,
    label: buildVariantSpecLabel({
      unitTypeName: spec.unitType.name,
      unitModelName: spec.unitModel.name,
      unitModelVariantName: spec.unitModelVariant.name,
      engineName: spec.engine.name,
      axleConfiguration: spec.axleConfiguration,
    }),
  };
}

async function assertRelationsExist(input: VariantSpecInput) {
  const [unitType, unitModel, unitModelVariant, engine] = await Promise.all([
    prisma.unitType.findFirst({ where: { id: input.unitTypeId, deletedAt: null } }),
    prisma.unitModel.findFirst({ where: { id: input.unitModelId, deletedAt: null } }),
    prisma.unitModelVariant.findFirst({ where: { id: input.unitModelVariantId, deletedAt: null } }),
    prisma.engine.findFirst({ where: { id: input.engineId, deletedAt: null } }),
  ]);

  if (!unitType) throw AppError.badRequest("Unit type is required", [{ field: "unitTypeId", message: "Unit type is required" }]);
  if (!unitModel) throw AppError.badRequest("Unit model is required", [{ field: "unitModelId", message: "Unit model is required" }]);
  if (!unitModelVariant) {
    throw AppError.badRequest("Unit model variant is required", [
      { field: "unitModelVariantId", message: "Unit model variant is required" },
    ]);
  }
  if (unitModelVariant.unitModelId !== input.unitModelId) {
    throw AppError.badRequest("Unit model variant does not belong to the selected unit model", [
      { field: "unitModelVariantId", message: "Unit model variant does not belong to the selected unit model" },
    ]);
  }
  if (!engine) throw AppError.badRequest("Engine is required", [{ field: "engineId", message: "Engine is required" }]);
}

async function assertComboNotTaken(input: VariantSpecInput, excludeId?: string) {
  const existing = await prisma.variantSpecification.findFirst({
    where: {
      unitTypeId: input.unitTypeId,
      unitModelId: input.unitModelId,
      unitModelVariantId: input.unitModelVariantId,
      engineId: input.engineId,
      deletedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  if (existing) {
    throw AppError.conflict(
      "This combination of Unit Type, Unit Model, Unit Model Variant, and Engine already exists"
    );
  }
}

export async function listVariantSpecifications(query: VariantSpecListQuery) {
  const { query: search, status, unitTypeId, unitModelId, engineId, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.VariantSpecificationWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(unitTypeId ? { unitTypeId } : {}),
    ...(unitModelId ? { unitModelId } : {}),
    ...(engineId ? { engineId } : {}),
    ...(search
      ? {
          OR: [
            { unitType: { name: { contains: search, mode: "insensitive" } } },
            { unitModel: { name: { contains: search, mode: "insensitive" } } },
            { unitModelVariant: { name: { contains: search, mode: "insensitive" } } },
            { engine: { name: { contains: search, mode: "insensitive" } } },
            { axleConfiguration: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.variantSpecification.findMany({
      where,
      include: INCLUDE,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.variantSpecification.count({ where }),
  ]);

  return {
    data: data.map(withLabel),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function getVariantSpecificationById(id: string) {
  const spec = await prisma.variantSpecification.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
  if (!spec) throw AppError.notFound("Variant specification not found");
  return withLabel(spec);
}

export async function createVariantSpecification(input: VariantSpecInput) {
  const parsed = variantSpecificationBodySchema.parse(input);
  await assertRelationsExist(parsed);
  await assertComboNotTaken(parsed);

  const created = await prisma.variantSpecification.create({
    data: {
      unitTypeId: parsed.unitTypeId,
      unitModelId: parsed.unitModelId,
      unitModelVariantId: parsed.unitModelVariantId,
      engineId: parsed.engineId,
      capacityVessel: parsed.capacityVessel,
      axleConfiguration: parsed.axleConfiguration,
      totalWheel: parsed.totalWheel,
      wheelSize: parsed.wheelSize,
      isActive: parsed.isActive ?? true,
    },
    include: INCLUDE,
  });
  return withLabel(created);
}

export async function updateVariantSpecification(id: string, input: VariantSpecInput) {
  await getVariantSpecificationById(id);
  const parsed = variantSpecificationBodySchema.parse(input);
  await assertRelationsExist(parsed);
  await assertComboNotTaken(parsed, id);

  const updated = await prisma.variantSpecification.update({
    where: { id },
    data: {
      unitTypeId: parsed.unitTypeId,
      unitModelId: parsed.unitModelId,
      unitModelVariantId: parsed.unitModelVariantId,
      engineId: parsed.engineId,
      capacityVessel: parsed.capacityVessel,
      axleConfiguration: parsed.axleConfiguration,
      totalWheel: parsed.totalWheel,
      wheelSize: parsed.wheelSize,
      isActive: parsed.isActive ?? true,
    },
    include: INCLUDE,
  });
  return withLabel(updated);
}

export async function softDeleteVariantSpecification(id: string) {
  await getVariantSpecificationById(id);
  const unitCount = await prisma.unit.count({ where: { variantSpecificationId: id, deletedAt: null } });
  if (unitCount > 0) {
    throw AppError.conflict(`Cannot delete this variant specification — it is still used by ${unitCount} unit(s)`);
  }
  await prisma.variantSpecification.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listVariantSpecificationsForExport() {
  const specs = await prisma.variantSpecification.findMany({
    where: { deletedAt: null },
    include: INCLUDE,
    orderBy: { createdAt: "asc" },
  });
  return specs.map(withLabel);
}
