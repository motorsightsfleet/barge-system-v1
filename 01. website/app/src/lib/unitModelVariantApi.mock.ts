import { ApiError } from "./api";
import type { UnitModelVariant, UnitModelVariantInput, UnitModelVariantListParams, Pagination } from "./unitModelVariantTypes";

const MOCK_UNIT_MODELS = [
  { id: "unit-model-ms700", name: "MS700" },
  { id: "unit-model-pc2000", name: "PC2000" },
];

function unitModelById(id: string) {
  return MOCK_UNIT_MODELS.find((m) => m.id === id) ?? MOCK_UNIT_MODELS[0];
}

let seq = 0;
function nextId() {
  seq += 1;
  return `mock-umv-${seq}`;
}
function now() {
  return new Date().toISOString();
}

const SEED = [
  { name: "8x4", unitModelId: "unit-model-ms700" },
  { name: "6x4", unitModelId: "unit-model-ms700" },
  { name: "Standard", unitModelId: "unit-model-pc2000" },
];

let store: UnitModelVariant[] = SEED.map((v) => ({
  id: nextId(),
  name: v.name,
  unitModelId: v.unitModelId,
  unitModel: unitModelById(v.unitModelId),
  isActive: true,
  createdAt: now(),
  updatedAt: now(),
}));

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
  mockUnitModels: MOCK_UNIT_MODELS,

  async list(params: UnitModelVariantListParams): Promise<{ data: UnitModelVariant[]; pagination: Pagination }> {
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
    const variant = store.find((v) => v.id === id);
    if (!variant) throw new ApiError("Unit model variant not found");
    return delay({ data: variant });
  },

  async create(input: UnitModelVariantInput): Promise<{ data: UnitModelVariant }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const duplicate = store.some((v) => v.name.toLowerCase() === input.name.toLowerCase() && v.unitModelId === input.unitModelId);
    if (duplicate) throw new ApiError("Unit model variant name already exists for this unit model");

    const variant: UnitModelVariant = {
      id: nextId(),
      name: input.name,
      unitModelId: input.unitModelId,
      unitModel: unitModelById(input.unitModelId),
      isActive: input.isActive ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    store = [variant, ...store];
    return delay({ data: variant });
  },

  async update(id: string, input: UnitModelVariantInput): Promise<{ data: UnitModelVariant }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const idx = store.findIndex((v) => v.id === id);
    if (idx === -1) throw new ApiError("Unit model variant not found");

    const duplicate = store.some(
      (v) => v.id !== id && v.name.toLowerCase() === input.name.toLowerCase() && v.unitModelId === input.unitModelId
    );
    if (duplicate) throw new ApiError("Unit model variant name already exists for this unit model");

    const updated: UnitModelVariant = {
      ...store[idx],
      name: input.name,
      unitModelId: input.unitModelId,
      unitModel: unitModelById(input.unitModelId),
      isActive: input.isActive ?? true,
      updatedAt: now(),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return delay({ data: updated });
  },

  async remove(id: string): Promise<{ data: null }> {
    const idx = store.findIndex((v) => v.id === id);
    if (idx === -1) throw new ApiError("Unit model variant not found");
    store = [...store.slice(0, idx), ...store.slice(idx + 1)];
    return delay({ data: null });
  },
};
