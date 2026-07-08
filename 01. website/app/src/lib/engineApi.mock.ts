import { ApiError } from "./api";
import type { Engine, EngineInput, EngineListParams, Pagination } from "./engineTypes";

const MOCK_BRANDS = [
  { id: "brand-cummins", name: "Cummins" },
  { id: "brand-komatsu", name: "Komatsu" },
];

function brandById(id: string) {
  return MOCK_BRANDS.find((b) => b.id === id) ?? MOCK_BRANDS[0];
}

let seq = 0;
function nextId() {
  seq += 1;
  return `mock-engine-${seq}`;
}
function now() {
  return new Date().toISOString();
}

const SEED = [
  { name: "Cummins QSX15", brandId: "brand-cummins" },
  { name: "Komatsu SAA6D170", brandId: "brand-komatsu" },
];

let store: Engine[] = SEED.map((e) => ({
  id: nextId(),
  name: e.name,
  brandId: e.brandId,
  brand: brandById(e.brandId),
  isActive: true,
  createdAt: now(),
  updatedAt: now(),
}));

function validate(input: EngineInput): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.name || !input.name.trim()) errors.push({ field: "name", message: "Engine name is required" });
  if (!input.brandId) errors.push({ field: "brandId", message: "Brand is required" });
  return errors;
}

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const engineApiMock = {
  mockBrands: MOCK_BRANDS,

  async list(params: EngineListParams): Promise<{ data: Engine[]; pagination: Pagination }> {
    const { query, status, brandId, page = 1, pageSize = 10, sortBy = "createdAt", sortDir = "desc" } = params;

    let filtered = store.filter((e) => {
      if (status && (status === "active") !== e.isActive) return false;
      if (brandId && e.brandId !== brandId) return false;
      if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false;
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

  async getOne(id: string): Promise<{ data: Engine }> {
    const engine = store.find((e) => e.id === id);
    if (!engine) throw new ApiError("Engine not found");
    return delay({ data: engine });
  },

  async create(input: EngineInput): Promise<{ data: Engine }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const duplicate = store.some((e) => e.name.toLowerCase() === input.name.toLowerCase() && e.brandId === input.brandId);
    if (duplicate) throw new ApiError("Engine name already exists for this brand");

    const engine: Engine = {
      id: nextId(),
      name: input.name,
      brandId: input.brandId,
      brand: brandById(input.brandId),
      isActive: input.isActive ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    store = [engine, ...store];
    return delay({ data: engine });
  },

  async update(id: string, input: EngineInput): Promise<{ data: Engine }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const idx = store.findIndex((e) => e.id === id);
    if (idx === -1) throw new ApiError("Engine not found");

    const duplicate = store.some(
      (e) => e.id !== id && e.name.toLowerCase() === input.name.toLowerCase() && e.brandId === input.brandId
    );
    if (duplicate) throw new ApiError("Engine name already exists for this brand");

    const updated: Engine = {
      ...store[idx],
      name: input.name,
      brandId: input.brandId,
      brand: brandById(input.brandId),
      isActive: input.isActive ?? true,
      updatedAt: now(),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return delay({ data: updated });
  },

  async remove(id: string): Promise<{ data: null }> {
    const idx = store.findIndex((e) => e.id === id);
    if (idx === -1) throw new ApiError("Engine not found");
    store = [...store.slice(0, idx), ...store.slice(idx + 1)];
    return delay({ data: null });
  },
};
