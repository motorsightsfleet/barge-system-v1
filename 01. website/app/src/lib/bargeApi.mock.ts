import { ApiError } from "./api";
import type { Barge, BargeInput, BargeListParams, Pagination } from "./bargeTypes";
import { BARGE_TYPES } from "./bargeTypes";

const BARGE_CODE_PREFIX = "MS-BS-";
let seq = 0;
function nextId() {
  seq += 1;
  return `mock-${seq}`;
}

function now() {
  return new Date().toISOString();
}

const SEED: Omit<Barge, "id" | "createdAt" | "updatedAt">[] = [
  { code: "MS-BS-001", name: "MOTORSIGHTS ALPHA", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-002", name: "MOTORSIGHTS BETA", owner: "PT. Koninis Fajar Mineral", capacityMt: 11500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-111", name: "MOTORSIGHTS OMEGA", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-201", name: "MOTORSIGHTS WOLF", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-511", name: "MOTORSIGHTS LION", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-512", name: "MOTORSIGHTS ELEPHANT", owner: "PT. Koninis Fajar Mineral", capacityMt: 11500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-513", name: "MOTORSIGHTS GOLD", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-211", name: "MOTORSIGHTS ROYAL", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "UNAVAILABLE" },
  { code: "MS-BS-221", name: "MOTORSIGHTS SUPREME", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-251", name: "MOTORSIGHTS ULTIMATE", owner: "PT. Koninis Fajar Mineral", capacityMt: 11500, type: "Nickel Carrier", status: "AVAILABLE" },
  { code: "MS-BS-069", name: "CITRA 339", owner: "PT Hartono Wijaya", capacityMt: 11500, type: "Coal Carrier", status: "AVAILABLE" },
];

let store: Barge[] = SEED.map((b) => ({ ...b, id: nextId(), createdAt: now(), updatedAt: now() }));

function validate(input: BargeInput): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.name || !input.name.trim()) errors.push({ field: "name", message: "Barge name is required" });
  if (!input.owner || !input.owner.trim()) errors.push({ field: "owner", message: "Barge owner is required" });
  if (!input.capacityMt || input.capacityMt <= 0) errors.push({ field: "capacityMt", message: "Barge capacity is required" });
  if (!input.type || !(BARGE_TYPES as readonly string[]).includes(input.type)) {
    errors.push({ field: "type", message: "Barge type is required" });
  }
  return errors;
}

function generateCode(): string {
  const maxNumber = store.reduce((max, b) => {
    const match = b.code.match(/^MS-BS-(\d+)$/);
    if (!match) return max;
    return Math.max(max, parseInt(match[1], 10));
  }, 0);
  return `${BARGE_CODE_PREFIX}${String(maxNumber + 1).padStart(3, "0")}`;
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const bargeApiMock = {
  async list(params: BargeListParams): Promise<{ data: Barge[]; pagination: Pagination }> {
    const { query, status, type, page = 1, pageSize = 10, sortBy = "createdAt", sortDir = "desc" } = params;

    let filtered = store.filter((b) => {
      if (status && b.status !== status) return false;
      if (type && b.type !== type) return false;
      if (query) {
        const q = query.toLowerCase();
        if (![b.code, b.name, b.owner].some((v) => v.toLowerCase().includes(q))) return false;
      }
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortBy];
      const bv = (b as unknown as Record<string, unknown>)[sortBy];
      if (av === bv) return 0;
      const cmp = av! > bv! ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return delay({ data, pagination: { page, pageSize, total, totalPages } });
  },

  async getOne(id: string): Promise<{ data: Barge }> {
    const barge = store.find((b) => b.id === id);
    if (!barge) throw new ApiError("Barge not found");
    return delay({ data: barge });
  },

  async create(input: BargeInput): Promise<{ data: Barge }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const barge: Barge = {
      id: nextId(),
      code: generateCode(),
      name: input.name,
      owner: input.owner,
      capacityMt: input.capacityMt,
      type: input.type,
      status: input.status ?? "AVAILABLE",
      createdAt: now(),
      updatedAt: now(),
    };
    store = [barge, ...store];
    return delay({ data: barge });
  },

  async update(id: string, input: BargeInput): Promise<{ data: Barge }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const idx = store.findIndex((b) => b.id === id);
    if (idx === -1) throw new ApiError("Barge not found");

    const updated: Barge = {
      ...store[idx],
      name: input.name,
      owner: input.owner,
      capacityMt: input.capacityMt,
      type: input.type,
      status: input.status ?? "AVAILABLE",
      updatedAt: now(),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return delay({ data: updated });
  },

  async remove(id: string): Promise<{ data: null }> {
    const idx = store.findIndex((b) => b.id === id);
    if (idx === -1) throw new ApiError("Barge not found");
    store = [...store.slice(0, idx), ...store.slice(idx + 1)];
    return delay({ data: null });
  },
};
