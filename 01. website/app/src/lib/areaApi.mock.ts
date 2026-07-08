import { ApiError } from "./api";
import type { Area, AreaInput, AreaListParams, Pagination } from "./areaTypes";
import { AREA_CATEGORIES } from "./areaTypes";
import { MOCK_SITES } from "./siteApi.mock";
import { isValidPolygonWkt } from "./wkt";

let seq = 0;
function nextId() {
  seq += 1;
  return `mock-area-${seq}`;
}
function now() {
  return new Date().toISOString();
}

const SAMPLE_POLYGON =
  "POLYGON((116.4500 -3.1200, 116.4521 -3.1192, 116.4548 -3.1195, 116.4572 -3.1208, 116.4591 -3.1230, 116.4595 -3.1257, 116.4583 -3.1281, 116.4560 -3.1294, 116.4532 -3.1298, 116.4509 -3.1287, 116.4495 -3.1264, 116.4493 -3.1237, 116.4500 -3.1200))";

function siteById(id: string) {
  return MOCK_SITES.find((s) => s.id === id) ?? MOCK_SITES[0];
}

const SEED: { areaName: string; siteId: string; category: string; isActive: boolean }[] = [
  { areaName: "EFO 1", siteId: "site-bunta", category: "Loading", isActive: true },
  { areaName: "EFO 2", siteId: "site-bunta", category: "Loading", isActive: true },
  { areaName: "EFO 3", siteId: "site-bunta", category: "Loading", isActive: true },
  { areaName: "EFO 4", siteId: "site-buleleng", category: "Loading", isActive: true },
  { areaName: "EFO 5", siteId: "site-buleleng", category: "Loading", isActive: true },
  { areaName: "JETTY 1", siteId: "site-buleleng", category: "Unloading", isActive: true },
  { areaName: "JETTY 2", siteId: "site-kabaena", category: "Unloading", isActive: true },
  { areaName: "JETTY 3", siteId: "site-kabaena", category: "Unloading", isActive: false },
  { areaName: "JETTY 4", siteId: "site-kabaena", category: "Unloading", isActive: true },
  { areaName: "JETTY 5", siteId: "site-kabaena", category: "Unloading", isActive: true },
  { areaName: "ANCHOR 1", siteId: "site-bunta", category: "Anchorage", isActive: true },
  { areaName: "ANCHOR 2", siteId: "site-kabaena", category: "Anchorage", isActive: true },
];

let store: Area[] = SEED.map((a) => ({
  id: nextId(),
  areaName: a.areaName,
  siteId: a.siteId,
  site: siteById(a.siteId),
  category: a.category,
  polygonCoordinates: SAMPLE_POLYGON,
  isActive: a.isActive,
  createdAt: now(),
  updatedAt: now(),
}));

function validate(input: AreaInput): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (!input.areaName || !input.areaName.trim()) errors.push({ field: "areaName", message: "Area name is required" });
  if (!input.siteId) errors.push({ field: "siteId", message: "Site is required" });
  if (!input.category || !(AREA_CATEGORIES as readonly string[]).includes(input.category)) {
    errors.push({ field: "category", message: "Category is required" });
  }
  if (!input.polygonCoordinates || !isValidPolygonWkt(input.polygonCoordinates)) {
    errors.push({ field: "polygonCoordinates", message: "Input the correct Latitude and Longitude" });
  }
  return errors;
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const areaApiMock = {
  async list(params: AreaListParams): Promise<{ data: Area[]; pagination: Pagination }> {
    const { query, status, siteId, page = 1, pageSize = 10, sortBy = "createdAt", sortDir = "desc" } = params;

    let filtered = store.filter((a) => {
      if (status && (status === "active") !== a.isActive) return false;
      if (siteId && a.siteId !== siteId) return false;
      if (query && !a.areaName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      const av = sortBy === "site" ? a.site.name : (a as unknown as Record<string, unknown>)[sortBy];
      const bv = sortBy === "site" ? b.site.name : (b as unknown as Record<string, unknown>)[sortBy];
      if (av === bv) return 0;
      const cmp = (av as string) > (bv as string) ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    return delay({ data: filtered.slice(start, start + pageSize), pagination: { page, pageSize, total, totalPages } });
  },

  async getOne(id: string): Promise<{ data: Area }> {
    const area = store.find((a) => a.id === id);
    if (!area) throw new ApiError("Area not found");
    return delay({ data: area });
  },

  async create(input: AreaInput): Promise<{ data: Area }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const duplicate = store.some((a) => a.areaName === input.areaName && a.siteId === input.siteId);
    if (duplicate) throw new ApiError("Area name already exists in this site");

    const area: Area = {
      id: nextId(),
      areaName: input.areaName,
      siteId: input.siteId,
      site: siteById(input.siteId),
      category: input.category,
      polygonCoordinates: input.polygonCoordinates,
      isActive: input.isActive ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    store = [area, ...store];
    return delay({ data: area });
  },

  async update(id: string, input: AreaInput): Promise<{ data: Area }> {
    const errors = validate(input);
    if (errors.length > 0) throw new ApiError(errors[0].message, errors);

    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new ApiError("Area not found");

    const duplicate = store.some(
      (a) => a.id !== id && a.areaName === input.areaName && a.siteId === input.siteId
    );
    if (duplicate) throw new ApiError("Area name already exists in this site");

    const updated: Area = {
      ...store[idx],
      areaName: input.areaName,
      siteId: input.siteId,
      site: siteById(input.siteId),
      category: input.category,
      polygonCoordinates: input.polygonCoordinates,
      isActive: input.isActive ?? true,
      updatedAt: now(),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return delay({ data: updated });
  },

  async remove(id: string): Promise<{ data: null }> {
    const idx = store.findIndex((a) => a.id === id);
    if (idx === -1) throw new ApiError("Area not found");
    store = [...store.slice(0, idx), ...store.slice(idx + 1)];
    return delay({ data: null });
  },
};
