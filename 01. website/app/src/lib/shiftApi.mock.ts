import { ApiError } from "./api";
import type { Shift, ShiftInput, ShiftListParams, Pagination } from "./shiftTypes";

let seq = 0;
function nextId() {
  seq += 1;
  return `mock-shift-${seq}`;
}
function now() {
  return new Date().toISOString();
}

const SEED: { shiftName: string; shiftStart: string; shiftEnd: string; isActive: boolean }[] = [
  { shiftName: "Shift A (Day Shift)", shiftStart: "07:00", shiftEnd: "19:00", isActive: true },
  { shiftName: "Shift B (Night Shift)", shiftStart: "19:00", shiftEnd: "07:00", isActive: true },
  { shiftName: "Shift C (Morning)", shiftStart: "06:00", shiftEnd: "14:00", isActive: false },
];

let store: Shift[] = SEED.map((s) => ({ ...s, id: nextId(), createdAt: now(), updatedAt: now() }));

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function validate(input: ShiftInput): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.shiftName || !input.shiftName.trim()) errors.push({ field: "shiftName", message: "Shift name is required" });
  if (!input.shiftStart || !input.shiftStart.trim()) {
    errors.push({ field: "shiftStart", message: "Shift start is required" });
  } else if (!TIME_PATTERN.test(input.shiftStart)) {
    errors.push({ field: "shiftStart", message: "Shift start must be a valid time (HH:mm)" });
  }
  if (!input.shiftEnd || !input.shiftEnd.trim()) {
    errors.push({ field: "shiftEnd", message: "Shift end is required" });
  } else if (!TIME_PATTERN.test(input.shiftEnd)) {
    errors.push({ field: "shiftEnd", message: "Shift end must be a valid time (HH:mm)" });
  }
  if (errors.length === 0 && input.shiftStart === input.shiftEnd) {
    errors.push({ field: "shiftEnd", message: "Start and end time cannot be the same" });
  }
  return errors;
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const shiftApiMock = {
  async list(params: ShiftListParams): Promise<{ data: Shift[]; pagination: Pagination }> {
    const { query, status, page = 1, pageSize = 10, sortBy = "createdAt", sortDir = "desc" } = params;

    let filtered = store.filter((s) => {
      if (status && (status === "active") !== s.isActive) return false;
      if (query && !s.shiftName.toLowerCase().includes(query.toLowerCase())) return false;
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

  async getOne(id: string): Promise<{ data: Shift }> {
    const shift = store.find((s) => s.id === id);
    if (!shift) throw new ApiError("Shift not found");
    return delay({ data: shift });
  },

  async create(input: ShiftInput): Promise<{ data: Shift }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const duplicate = store.some((s) => s.shiftName === input.shiftName);
    if (duplicate) throw new ApiError("Shift name already exists");

    const shift: Shift = {
      id: nextId(),
      shiftName: input.shiftName,
      shiftStart: input.shiftStart,
      shiftEnd: input.shiftEnd,
      isActive: input.isActive ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    store = [shift, ...store];
    return delay({ data: shift });
  },

  async update(id: string, input: ShiftInput): Promise<{ data: Shift }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) throw new ApiError("Shift not found");

    const duplicate = store.some((s) => s.id !== id && s.shiftName === input.shiftName);
    if (duplicate) throw new ApiError("Shift name already exists");

    const updated: Shift = {
      ...store[idx],
      shiftName: input.shiftName,
      shiftStart: input.shiftStart,
      shiftEnd: input.shiftEnd,
      isActive: input.isActive ?? true,
      updatedAt: now(),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return delay({ data: updated });
  },

  async remove(id: string): Promise<{ data: null }> {
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) throw new ApiError("Shift not found");
    store = [...store.slice(0, idx), ...store.slice(idx + 1)];
    return delay({ data: null });
  },
};
