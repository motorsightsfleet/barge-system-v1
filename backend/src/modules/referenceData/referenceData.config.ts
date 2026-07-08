import { prisma } from "../../lib/prisma";
import { buildReferenceDataBodySchema } from "./referenceData.validation";
import type { ReferenceDataType } from "./referenceData.constants";

export interface SimpleEntity {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Brand / UnitType / UnitModel are structurally identical models (id, name, isActive,
// timestamps, soft-delete) — this loose delegate shape lets one generic service drive
// all three without fighting Prisma's per-model nominal arg types (each model's
// generated FindManyArgs etc. is a distinct, incompatible type, so `args` is untyped here).
export interface SimpleDelegate {
  findMany(args: any): Promise<SimpleEntity[]>;
  count(args: any): Promise<number>;
  findFirst(args: any): Promise<SimpleEntity | null>;
  create(args: any): Promise<SimpleEntity>;
  update(args: any): Promise<SimpleEntity>;
}

interface DependentGuard {
  label: string;
  count: (id: string) => Promise<number>;
}

export interface ReferenceDataTypeConfig {
  delegate: SimpleDelegate;
  entityLabel: string;
  entityLabelPlural: string;
  entityLabelLower: string;
  exportFilename: string;
  bodySchema: ReturnType<typeof buildReferenceDataBodySchema>;
  dependents: DependentGuard[];
}

export const REFERENCE_DATA_CONFIG: Record<ReferenceDataType, ReferenceDataTypeConfig> = {
  brand: {
    delegate: prisma.brand,
    entityLabel: "Brand",
    entityLabelPlural: "Brands",
    entityLabelLower: "brand",
    exportFilename: "brands.csv",
    bodySchema: buildReferenceDataBodySchema("Brand"),
    dependents: [
      { label: "engine(s)", count: (id) => prisma.engine.count({ where: { brandId: id, deletedAt: null } }) },
    ],
  },
  "unit-type": {
    delegate: prisma.unitType,
    entityLabel: "Unit type",
    entityLabelPlural: "Unit types",
    entityLabelLower: "unit type",
    exportFilename: "unit-types.csv",
    bodySchema: buildReferenceDataBodySchema("Unit type"),
    dependents: [
      {
        label: "variant specification(s)",
        count: (id) => prisma.variantSpecification.count({ where: { unitTypeId: id, deletedAt: null } }),
      },
    ],
  },
  "unit-model": {
    delegate: prisma.unitModel,
    entityLabel: "Unit model",
    entityLabelPlural: "Unit models",
    entityLabelLower: "unit model",
    exportFilename: "unit-models.csv",
    bodySchema: buildReferenceDataBodySchema("Unit model"),
    dependents: [
      {
        label: "unit model variant(s)",
        count: (id) => prisma.unitModelVariant.count({ where: { unitModelId: id, deletedAt: null } }),
      },
      {
        label: "variant specification(s)",
        count: (id) => prisma.variantSpecification.count({ where: { unitModelId: id, deletedAt: null } }),
      },
    ],
  },
};
