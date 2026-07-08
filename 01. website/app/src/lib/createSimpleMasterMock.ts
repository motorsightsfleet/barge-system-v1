import { ApiError } from "./api";
import type { SimpleMasterEntity, SimpleMasterInput, SimpleMasterListParams, Pagination } from "./simpleMasterTypes";

export function createSimpleMasterMock(entityLabel: string, seedNames: string[]) {
  let seq = 0;
  function nextId() {
    seq += 1;
    return `mock-${entityLabel.toLowerCase().replace(/\s+/g, "-")}-${seq}`;
  }
  function now() {
    return new Date().toISOString();
  }

  let store: SimpleMasterEntity[] = seedNames.map((name) => ({
    id: nextId(),
    name,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  }));

  function validate(input: SimpleMasterInput): { field: string; message: string }[] {
    if (!input.name || !input.name.trim()) {
      return [{ field: "name", message: `${entityLabel} name is required` }];
    }
    return [];
  }

  function delay<T>(value: T, ms = 200): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
  }

  return {
    async list(params: SimpleMasterListParams): Promise<{ data: SimpleMasterEntity[]; pagination: Pagination }> {
      const { query, status, page = 1, pageSize = 10, sortBy = "createdAt", sortDir = "desc" } = params;

      let filtered = store.filter((e) => {
        if (status && (status === "active") !== e.isActive) return false;
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

    async getOne(id: string): Promise<{ data: SimpleMasterEntity }> {
      const entity = store.find((e) => e.id === id);
      if (!entity) throw new ApiError(`${entityLabel} not found`);
      return delay({ data: entity });
    },

    async create(input: SimpleMasterInput): Promise<{ data: SimpleMasterEntity }> {
      const errors = validate(input);
      if (errors.length > 0) throw new ApiError(errors[0].message, errors);

      const duplicate = store.some((e) => e.name.toLowerCase() === input.name.toLowerCase());
      if (duplicate) throw new ApiError(`${entityLabel} name already exists`);

      const entity: SimpleMasterEntity = {
        id: nextId(),
        name: input.name,
        isActive: input.isActive ?? true,
        createdAt: now(),
        updatedAt: now(),
      };
      store = [entity, ...store];
      return delay({ data: entity });
    },

    async update(id: string, input: SimpleMasterInput): Promise<{ data: SimpleMasterEntity }> {
      const errors = validate(input);
      if (errors.length > 0) throw new ApiError(errors[0].message, errors);

      const idx = store.findIndex((e) => e.id === id);
      if (idx === -1) throw new ApiError(`${entityLabel} not found`);

      const duplicate = store.some((e) => e.id !== id && e.name.toLowerCase() === input.name.toLowerCase());
      if (duplicate) throw new ApiError(`${entityLabel} name already exists`);

      const updated: SimpleMasterEntity = { ...store[idx], name: input.name, isActive: input.isActive ?? true, updatedAt: now() };
      store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
      return delay({ data: updated });
    },

    async remove(id: string): Promise<{ data: null }> {
      const idx = store.findIndex((e) => e.id === id);
      if (idx === -1) throw new ApiError(`${entityLabel} not found`);
      store = [...store.slice(0, idx), ...store.slice(idx + 1)];
      return delay({ data: null });
    },
  };
}
