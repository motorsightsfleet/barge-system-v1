import { ApiError } from "./api";
import type {
  VariantSpecification,
  VariantSpecificationInput,
  VariantSpecificationListParams,
  Pagination,
} from "./variantSpecificationTypes";
import { unitTypeApi } from "./unitTypeApi";
import { unitModelApi } from "./unitModelApi";
import { unitModelVariantApi } from "./unitModelVariantApi";
import { engineApi } from "./engineApi";

let seq = 0;
function nextId() {
  seq += 1;
  return `mock-variant-spec-${seq}`;
}
function now() {
  return new Date().toISOString();
}

function buildLabel(unitTypeName: string, unitModelName: string, unitModelVariantName: string, engineName: string, axleConfiguration: string) {
  return [unitTypeName, unitModelName, unitModelVariantName, engineName, axleConfiguration].join(" | ");
}

let store: VariantSpecification[] = [];
let seedingPromise: Promise<void> | null = null;

const SEED_DEFS = [
  { unitType: "Dump Truck", unitModel: "MS700", variant: "8x4", engine: "Cummins QSX15", capacityVessel: 20, axleConfiguration: "8x4", totalWheel: 12, wheelSize: 24 },
  { unitType: "Dump Truck", unitModel: "MS700", variant: "6x4", engine: "Cummins QSX15", capacityVessel: 15, axleConfiguration: "6x4", totalWheel: 10, wheelSize: 22 },
  { unitType: "Excavator", unitModel: "PC2000", variant: "Standard", engine: "Komatsu SAA6D170", capacityVessel: 11, axleConfiguration: "N/A", totalWheel: 0, wheelSize: 0 },
];

function ensureSeeded(): Promise<void> {
  if (!seedingPromise) {
    seedingPromise = (async () => {
      const [unitTypes, unitModels, variants, engines] = await Promise.all([
        unitTypeApi.list({ pageSize: 100 }),
        unitModelApi.list({ pageSize: 100 }),
        unitModelVariantApi.list({ pageSize: 100 }),
        engineApi.list({ pageSize: 100 }),
      ]);

      const built: VariantSpecification[] = [];
      for (const def of SEED_DEFS) {
        const unitType = unitTypes.data.find((u) => u.name === def.unitType);
        const unitModel = unitModels.data.find((u) => u.name === def.unitModel);
        if (!unitType || !unitModel) continue;
        const variant = variants.data.find((v) => v.name === def.variant && v.unitModelId === unitModel.id);
        const engine = engines.data.find((e) => e.name === def.engine);
        if (!variant || !engine) continue;

        built.push({
          id: nextId(),
          unitTypeId: unitType.id,
          unitType: { id: unitType.id, name: unitType.name },
          unitModelId: unitModel.id,
          unitModel: { id: unitModel.id, name: unitModel.name },
          unitModelVariantId: variant.id,
          unitModelVariant: { id: variant.id, name: variant.name, unitModelId: variant.unitModelId },
          engineId: engine.id,
          engine: { id: engine.id, name: engine.name, brandId: engine.brandId, brand: engine.brand },
          capacityVessel: def.capacityVessel,
          axleConfiguration: def.axleConfiguration,
          totalWheel: def.totalWheel,
          wheelSize: def.wheelSize,
          isActive: true,
          createdAt: now(),
          updatedAt: now(),
          label: buildLabel(unitType.name, unitModel.name, variant.name, engine.name, def.axleConfiguration),
        });
      }
      store = built;
    })();
  }
  return seedingPromise;
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function resolveRelations(input: VariantSpecificationInput) {
  const errors: { field: string; message: string }[] = [];
  if (!input.unitTypeId) errors.push({ field: "unitTypeId", message: "Unit type is required" });
  if (!input.unitModelId) errors.push({ field: "unitModelId", message: "Unit model is required" });
  if (!input.unitModelVariantId) errors.push({ field: "unitModelVariantId", message: "Unit model variant is required" });
  if (!input.engineId) errors.push({ field: "engineId", message: "Engine is required" });
  if (!input.axleConfiguration || !input.axleConfiguration.trim()) errors.push({ field: "axleConfiguration", message: "Axle configuration is required" });
  if (!input.capacityVessel || input.capacityVessel <= 0) errors.push({ field: "capacityVessel", message: "Capacity vessel is required" });
  if (input.totalWheel === undefined || input.totalWheel === null || Number.isNaN(input.totalWheel)) {
    errors.push({ field: "totalWheel", message: "Total wheel is required" });
  }
  if (input.wheelSize === undefined || input.wheelSize === null || Number.isNaN(input.wheelSize)) {
    errors.push({ field: "wheelSize", message: "Wheel size is required" });
  }
  if (errors.length > 0) throw new ApiError(errors[0].message, errors);

  const [unitTypeRes, unitModelRes, variantRes, engineRes] = await Promise.all([
    unitTypeApi.getOne(input.unitTypeId).catch(() => null),
    unitModelApi.getOne(input.unitModelId).catch(() => null),
    unitModelVariantApi.getOne(input.unitModelVariantId).catch(() => null),
    engineApi.getOne(input.engineId).catch(() => null),
  ]);

  if (!unitTypeRes) throw new ApiError("Unit type is required", [{ field: "unitTypeId", message: "Unit type is required" }]);
  if (!unitModelRes) throw new ApiError("Unit model is required", [{ field: "unitModelId", message: "Unit model is required" }]);
  if (!variantRes) {
    throw new ApiError("Unit model variant is required", [{ field: "unitModelVariantId", message: "Unit model variant is required" }]);
  }
  if (variantRes.data.unitModelId !== input.unitModelId) {
    throw new ApiError("Unit model variant does not belong to the selected unit model", [
      { field: "unitModelVariantId", message: "Unit model variant does not belong to the selected unit model" },
    ]);
  }
  if (!engineRes) throw new ApiError("Engine is required", [{ field: "engineId", message: "Engine is required" }]);

  return {
    unitType: { id: unitTypeRes.data.id, name: unitTypeRes.data.name },
    unitModel: { id: unitModelRes.data.id, name: unitModelRes.data.name },
    unitModelVariant: { id: variantRes.data.id, name: variantRes.data.name, unitModelId: variantRes.data.unitModelId },
    engine: {
      id: engineRes.data.id,
      name: engineRes.data.name,
      brandId: engineRes.data.brandId,
      brand: engineRes.data.brand,
    },
    capacityVessel: input.capacityVessel as number,
    totalWheel: input.totalWheel as number,
    wheelSize: input.wheelSize as number,
  };
}

function assertComboNotTaken(input: VariantSpecificationInput, excludeId?: string) {
  const duplicate = store.some(
    (s) =>
      s.unitTypeId === input.unitTypeId &&
      s.unitModelId === input.unitModelId &&
      s.unitModelVariantId === input.unitModelVariantId &&
      s.engineId === input.engineId &&
      s.id !== excludeId
  );
  if (duplicate) {
    throw new ApiError("This combination of Unit Type, Unit Model, Unit Model Variant, and Engine already exists");
  }
}

export const variantSpecificationApiMock = {
  async list(params: VariantSpecificationListParams): Promise<{ data: VariantSpecification[]; pagination: Pagination }> {
    await ensureSeeded();
    const { query, status, unitTypeId, unitModelId, engineId, page = 1, pageSize = 10, sortBy = "createdAt", sortDir = "desc" } = params;

    let filtered = store.filter((s) => {
      if (status && (status === "active") !== s.isActive) return false;
      if (unitTypeId && s.unitTypeId !== unitTypeId) return false;
      if (unitModelId && s.unitModelId !== unitModelId) return false;
      if (engineId && s.engineId !== engineId) return false;
      if (query && !s.label.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortBy];
      const bv = (b as unknown as Record<string, unknown>)[sortBy];
      if (av === bv) return 0;
      const cmp = (av as number | string) > (bv as number | string) ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    return delay({ data: filtered.slice(start, start + pageSize), pagination: { page, pageSize, total, totalPages } });
  },

  async getOne(id: string): Promise<{ data: VariantSpecification }> {
    await ensureSeeded();
    const spec = store.find((s) => s.id === id);
    if (!spec) throw new ApiError("Variant specification not found");
    return delay({ data: spec });
  },

  async create(input: VariantSpecificationInput): Promise<{ data: VariantSpecification }> {
    await ensureSeeded();
    const relations = await resolveRelations(input);
    assertComboNotTaken(input);

    const spec: VariantSpecification = {
      id: nextId(),
      unitTypeId: input.unitTypeId,
      unitType: relations.unitType,
      unitModelId: input.unitModelId,
      unitModel: relations.unitModel,
      unitModelVariantId: input.unitModelVariantId,
      unitModelVariant: relations.unitModelVariant,
      engineId: input.engineId,
      engine: relations.engine,
      capacityVessel: relations.capacityVessel,
      axleConfiguration: input.axleConfiguration,
      totalWheel: relations.totalWheel,
      wheelSize: relations.wheelSize,
      isActive: input.isActive ?? true,
      createdAt: now(),
      updatedAt: now(),
      label: buildLabel(relations.unitType.name, relations.unitModel.name, relations.unitModelVariant.name, relations.engine.name, input.axleConfiguration),
    };
    store = [spec, ...store];
    return delay({ data: spec });
  },

  async update(id: string, input: VariantSpecificationInput): Promise<{ data: VariantSpecification }> {
    await ensureSeeded();
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) throw new ApiError("Variant specification not found");

    const relations = await resolveRelations(input);
    assertComboNotTaken(input, id);

    const updated: VariantSpecification = {
      ...store[idx],
      unitTypeId: input.unitTypeId,
      unitType: relations.unitType,
      unitModelId: input.unitModelId,
      unitModel: relations.unitModel,
      unitModelVariantId: input.unitModelVariantId,
      unitModelVariant: relations.unitModelVariant,
      engineId: input.engineId,
      engine: relations.engine,
      capacityVessel: relations.capacityVessel,
      axleConfiguration: input.axleConfiguration,
      totalWheel: relations.totalWheel,
      wheelSize: relations.wheelSize,
      isActive: input.isActive ?? true,
      updatedAt: now(),
      label: buildLabel(relations.unitType.name, relations.unitModel.name, relations.unitModelVariant.name, relations.engine.name, input.axleConfiguration),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return delay({ data: updated });
  },

  async remove(id: string): Promise<{ data: null }> {
    await ensureSeeded();
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) throw new ApiError("Variant specification not found");
    store = [...store.slice(0, idx), ...store.slice(idx + 1)];
    return delay({ data: null });
  },
};
