import { ApiError } from "./api";
import type { UnitModelVariant, UnitModelVariantInput, UnitModelVariantListParams, Pagination, UnitModelRef } from "./unitModelVariantTypes";
import { unitModelApi } from "./unitModelApi";

let seq = 0;
function nextId() {
  seq += 1;
  return `mock-umv-${seq}`;
}
function now() {
  return new Date().toISOString();
}

const SEED_DEFS = [
  { name: "8x4", unitModelName: "MS700" },
  { name: "6x4", unitModelName: "MS700" },
  { name: "Standard", unitModelName: "PC2000" },
];

let store: UnitModelVariant[] = [];
let seedingPromise: Promise<void> | null = null;

function ensureSeeded(): Promise<void> {
  if (!seedingPromise) {
    seedingPromise = (async () => {
      const unitModelsRes = await unitModelApi.list({ pageSize: 100 });
      const unitModels = unitModelsRes.data as unknown as UnitModelRef[];

      const built: UnitModelVariant[] = [];
      for (const def of SEED_DEFS) {
        const unitModel = unitModels.find((m) => m.name === def.unitModelName);
        if (!unitModel) continue;
        built.push({
          id: nextId(),
          name: def.name,
          unitModelId: unitModel.id,
          unitModel: { id: unitModel.id, name: unitModel.name },
          isActive: true,
          createdAt: now(),
          updatedAt: now(),
        });
      }
      store = built;
    })();
  }
  return seedingPromise;
}

async function resolveUnitModel(unitModelId: string): Promise<UnitModelRef> {
  const unitModelsRes = await unitModelApi.list({ pageSize: 100 });
  const unitModel = (unitModelsRes.data as unknown as UnitModelRef[]).find((m) => m.id === unitModelId);
  if (!unitModel) throw new ApiError("Unit model is required", [{ field: "unitModelId", message: "Unit model is required" }]);
  return { id: unitModel.id, name: unitModel.name };
}

function validate(input: UnitModelVariantInput): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.name || !input.name.trim()) errors.push({ field: "name", message: "Unit model variant name is required" });
  if (!input.unitModelId) errors.push({ field: "unitModelId", message: "Unit model is required" });
  return errors;
}

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const unitModelVariantApiMock = {
  async list(params: UnitModelVariantListParams): Promise<{ data: UnitModelVariant[]; pagination: Pagination }> {
    await ensureSeeded();
    const { query, status, unitModelId, page = 1, pageSize = 10, sortBy = "createdAt", sortDir = "desc" } = params;

    let filtered = store.filter((v) => {
      if (status && (status === "active") !== v.isActive) return false;
      if (unitModelId && v.unitModelId !== unitModelId) return false;
      if (query && !v.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortBy];
      const bv = (b as unknown as Record<string, unknown>)[sortBy];
      if (av === bv) return 0;
      const cmp = (av as string) > (bv as string) ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    return delay({ data: filtered.slice(start, start + pageSize), pagination: { page, pageSize, total, totalPages } });
  },

  async getOne(id: string): Promise<{ data: UnitModelVariant }> {
    await ensureSeeded();
    const variant = store.find((v) => v.id === id);
    if (!variant) throw new ApiError("Unit model variant not found");
    return delay({ data: variant });
  },

  async create(input: UnitModelVariantInput): Promise<{ data: UnitModelVariant }> {
    await ensureSeeded();
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const duplicate = store.some((v) => v.name.toLowerCase() === input.name.toLowerCase() && v.unitModelId === input.unitModelId);
    if (duplicate) throw new ApiError("Unit model variant name already exists for this unit model");

    const unitModel = await resolveUnitModel(input.unitModelId);
    const variant: UnitModelVariant = {
      id: nextId(),
      name: input.name,
      unitModelId: input.unitModelId,
      unitModel,
      isActive: input.isActive ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    store = [variant, ...store];
    return delay({ data: variant });
  },

  async update(id: string, input: UnitModelVariantInput): Promise<{ data: UnitModelVariant }> {
    await ensureSeeded();
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const idx = store.findIndex((v) => v.id === id);
    if (idx === -1) throw new ApiError("Unit model variant not found");

    const duplicate = store.some(
      (v) => v.id !== id && v.name.toLowerCase() === input.name.toLowerCase() && v.unitModelId === input.unitModelId
    );
    if (duplicate) throw new ApiError("Unit model variant name already exists for this unit model");

    const unitModel = await resolveUnitModel(input.unitModelId);
    const updated: UnitModelVariant = {
      ...store[idx],
      name: input.name,
      unitModelId: input.unitModelId,
      unitModel,
      isActive: input.isActive ?? true,
      updatedAt: now(),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return delay({ data: updated });
  },

  async remove(id: string): Promise<{ data: null }> {
    await ensureSeeded();
    const idx = store.findIndex((v) => v.id === id);
    if (idx === -1) throw new ApiError("Unit model variant not found");
    store = [...store.slice(0, idx), ...store.slice(idx + 1)];
    return delay({ data: null });
  },
};
