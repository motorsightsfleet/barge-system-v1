import { ApiError } from "./api";
import type { Unit, UnitInput, UnitListParams, Pagination, ResolvedSpecification } from "./unitTypes";
import { siteApi } from "./siteApi";
import { variantSpecificationApi } from "./variantSpecificationApi";
import { engineApi } from "./engineApi";

let seq = 0;
function nextId() {
  seq += 1;
  return `mock-unit-${seq}`;
}
function now() {
  return new Date().toISOString();
}

let store: Unit[] = [];
let seedingPromise: Promise<void> | null = null;

const SEED_DEFS = [
  { unitCode: "MS-DT-001", site: "Bunta", specLabelIncludes: "8x4", unitStatus: "Ready for Use (RFU)", serialNumber: "SN-DT-001", arriveDate: "2026-01-15", isActive: true },
  { unitCode: "MS-DT-002", site: "Bunta", specLabelIncludes: "8x4", unitStatus: "Operating", serialNumber: "SN-DT-002", arriveDate: "2026-01-18", isActive: true },
  { unitCode: "MS-DT-003", site: "Buleleng", specLabelIncludes: "6x4", unitStatus: "Ready for Use (RFU)", serialNumber: "SN-DT-003", arriveDate: "2026-02-02", isActive: true },
  { unitCode: "MS-DT-004", site: "Buleleng", specLabelIncludes: "6x4", unitStatus: "Under Maintenance", serialNumber: "SN-DT-004", arriveDate: "2026-02-10", isActive: true },
  { unitCode: "MS-DT-005", site: "Kabaena", specLabelIncludes: "8x4", unitStatus: "Breakdown", serialNumber: "SN-DT-005", arriveDate: "2025-11-20", isActive: false },
  { unitCode: "MS-EX-001", site: "Kabaena", specLabelIncludes: "Standard", unitStatus: "Ready for Use (RFU)", serialNumber: "SN-EX-001", arriveDate: "2025-11-05", isActive: true },
  { unitCode: "MS-EX-002", site: "Bunta", specLabelIncludes: "Standard", unitStatus: "Operating", serialNumber: "SN-EX-002", arriveDate: "2026-03-01", isActive: true },
];

function buildResolvedSpecification(unit: {
  variantSpecification: Unit["variantSpecification"];
  engineOverrideId: string | null;
  engineOverride?: Unit["variantSpecification"]["engine"];
  capacityVesselOverride: number | null;
  axleConfigurationOverride: string | null;
  totalWheelOverride: number | null;
  wheelSizeOverride: number | null;
}): ResolvedSpecification {
  const spec = unit.variantSpecification;
  return {
    engine: unit.engineOverride ?? spec.engine,
    capacityVessel: unit.capacityVesselOverride ?? spec.capacityVessel,
    axleConfiguration: unit.axleConfigurationOverride ?? spec.axleConfiguration,
    totalWheel: unit.totalWheelOverride ?? spec.totalWheel,
    wheelSize: unit.wheelSizeOverride ?? spec.wheelSize,
    isOverridden: {
      engine: unit.engineOverrideId !== null,
      capacityVessel: unit.capacityVesselOverride !== null,
      axleConfiguration: unit.axleConfigurationOverride !== null,
      totalWheel: unit.totalWheelOverride !== null,
      wheelSize: unit.wheelSizeOverride !== null,
    },
  };
}

function ensureSeeded(): Promise<void> {
  if (!seedingPromise) {
    seedingPromise = (async () => {
      const [sitesRes, specsRes] = await Promise.all([
        siteApi.list(),
        variantSpecificationApi.list({ pageSize: 100 }),
      ]);

      const built: Unit[] = [];
      for (const def of SEED_DEFS) {
        const site = sitesRes.data.find((s) => s.name === def.site);
        const spec = specsRes.data.find((s) => s.label.includes(def.specLabelIncludes));
        if (!site || !spec) continue;

        const base = {
          variantSpecification: spec,
          engineOverrideId: null,
          engineOverride: undefined,
          capacityVesselOverride: null,
          axleConfigurationOverride: null,
          totalWheelOverride: null,
          wheelSizeOverride: null,
        };

        built.push({
          id: nextId(),
          unitCode: def.unitCode,
          siteId: site.id,
          site,
          variantSpecificationId: spec.id,
          variantSpecification: spec,
          unitStatus: def.unitStatus,
          serialNumber: def.serialNumber,
          arriveDate: def.arriveDate,
          isActive: def.isActive,
          engineOverrideId: null,
          capacityVesselOverride: null,
          axleConfigurationOverride: null,
          totalWheelOverride: null,
          wheelSizeOverride: null,
          resolvedSpecification: buildResolvedSpecification(base),
          createdAt: now(),
          updatedAt: now(),
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

async function resolveRelations(input: UnitInput) {
  const errors: { field: string; message: string }[] = [];
  if (!input.unitCode || !input.unitCode.trim()) errors.push({ field: "unitCode", message: "Unit code is required" });
  if (!input.siteId) errors.push({ field: "siteId", message: "Site is required" });
  if (!input.variantSpecificationId) errors.push({ field: "variantSpecificationId", message: "Variant specification is required" });
  if (!input.unitStatus) errors.push({ field: "unitStatus", message: "Unit status is required" });
  if (!input.serialNumber || !input.serialNumber.trim()) errors.push({ field: "serialNumber", message: "Serial number is required" });
  if (!input.arriveDate || Number.isNaN(new Date(input.arriveDate).getTime())) {
    errors.push({ field: "arriveDate", message: "Arrive date is required" });
  }
  if (
    input.capacityVesselOverride !== null &&
    input.capacityVesselOverride !== undefined &&
    input.capacityVesselOverride <= 0
  ) {
    errors.push({ field: "capacityVesselOverride", message: "Capacity vessel must be greater than 0" });
  }
  if (errors.length > 0) throw new ApiError(errors[0].message, errors);

  const [siteRes, specRes, engineOverrideRes] = await Promise.all([
    siteApi.list().then((res) => res.data.find((s) => s.id === input.siteId) ?? null),
    variantSpecificationApi.getOne(input.variantSpecificationId).catch(() => null),
    input.engineOverrideId ? engineApi.getOne(input.engineOverrideId).catch(() => null) : Promise.resolve(null),
  ]);

  if (!siteRes) throw new ApiError("Site is required", [{ field: "siteId", message: "Site is required" }]);
  if (!specRes) {
    throw new ApiError("Variant specification is required", [
      { field: "variantSpecificationId", message: "Variant specification is required" },
    ]);
  }
  if (input.engineOverrideId && !engineOverrideRes) {
    throw new ApiError("Selected override engine is invalid", [
      { field: "engineOverrideId", message: "Selected override engine is invalid" },
    ]);
  }

  return { site: siteRes, spec: specRes.data, engineOverride: engineOverrideRes?.data ?? null };
}

async function assertUnitCodeNotTaken(unitCode: string, excludeId?: string) {
  const duplicate = store.some((u) => u.unitCode === unitCode && u.id !== excludeId);
  if (duplicate) throw new ApiError("Unit code already exists");
}

export const unitApiMock = {
  async list(params: UnitListParams): Promise<{ data: Unit[]; pagination: Pagination }> {
    await ensureSeeded();
    const { query, status, siteId, unitStatus, page = 1, pageSize = 10, sortBy = "createdAt", sortDir = "desc" } = params;

    let filtered = store.filter((u) => {
      if (status && (status === "active") !== u.isActive) return false;
      if (siteId && u.siteId !== siteId) return false;
      if (unitStatus && u.unitStatus !== unitStatus) return false;
      if (query) {
        const q = query.toLowerCase();
        const matches =
          u.unitCode.toLowerCase().includes(q) ||
          u.serialNumber.toLowerCase().includes(q) ||
          u.variantSpecification.unitType.name.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortBy === "unitType") {
        av = a.variantSpecification.unitType.name;
        bv = b.variantSpecification.unitType.name;
      } else if (sortBy === "site") {
        av = a.site.name;
        bv = b.site.name;
      } else {
        av = (a as unknown as Record<string, string>)[sortBy];
        bv = (b as unknown as Record<string, string>)[sortBy];
      }
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    return delay({ data: filtered.slice(start, start + pageSize), pagination: { page, pageSize, total, totalPages } });
  },

  async getOne(id: string): Promise<{ data: Unit }> {
    await ensureSeeded();
    const unit = store.find((u) => u.id === id);
    if (!unit) throw new ApiError("Unit not found");
    return delay({ data: unit });
  },

  async create(input: UnitInput): Promise<{ data: Unit }> {
    await ensureSeeded();
    const relations = await resolveRelations(input);
    await assertUnitCodeNotTaken(input.unitCode);

    const base = {
      variantSpecification: relations.spec,
      engineOverrideId: input.engineOverrideId ?? null,
      engineOverride: relations.engineOverride ?? undefined,
      capacityVesselOverride: input.capacityVesselOverride ?? null,
      axleConfigurationOverride: input.axleConfigurationOverride ?? null,
      totalWheelOverride: input.totalWheelOverride ?? null,
      wheelSizeOverride: input.wheelSizeOverride ?? null,
    };

    const unit: Unit = {
      id: nextId(),
      unitCode: input.unitCode,
      siteId: input.siteId,
      site: relations.site,
      variantSpecificationId: input.variantSpecificationId,
      variantSpecification: relations.spec,
      unitStatus: input.unitStatus,
      serialNumber: input.serialNumber,
      arriveDate: input.arriveDate,
      isActive: input.isActive ?? true,
      engineOverrideId: input.engineOverrideId ?? null,
      capacityVesselOverride: input.capacityVesselOverride ?? null,
      axleConfigurationOverride: input.axleConfigurationOverride ?? null,
      totalWheelOverride: input.totalWheelOverride ?? null,
      wheelSizeOverride: input.wheelSizeOverride ?? null,
      resolvedSpecification: buildResolvedSpecification(base),
      createdAt: now(),
      updatedAt: now(),
    };
    store = [unit, ...store];
    return delay({ data: unit });
  },

  async update(id: string, input: UnitInput): Promise<{ data: Unit }> {
    await ensureSeeded();
    const idx = store.findIndex((u) => u.id === id);
    if (idx === -1) throw new ApiError("Unit not found");

    const relations = await resolveRelations(input);
    await assertUnitCodeNotTaken(input.unitCode, id);

    const base = {
      variantSpecification: relations.spec,
      engineOverrideId: input.engineOverrideId ?? null,
      engineOverride: relations.engineOverride ?? undefined,
      capacityVesselOverride: input.capacityVesselOverride ?? null,
      axleConfigurationOverride: input.axleConfigurationOverride ?? null,
      totalWheelOverride: input.totalWheelOverride ?? null,
      wheelSizeOverride: input.wheelSizeOverride ?? null,
    };

    const updated: Unit = {
      ...store[idx],
      unitCode: input.unitCode,
      siteId: input.siteId,
      site: relations.site,
      variantSpecificationId: input.variantSpecificationId,
      variantSpecification: relations.spec,
      unitStatus: input.unitStatus,
      serialNumber: input.serialNumber,
      arriveDate: input.arriveDate,
      isActive: input.isActive ?? true,
      engineOverrideId: input.engineOverrideId ?? null,
      capacityVesselOverride: input.capacityVesselOverride ?? null,
      axleConfigurationOverride: input.axleConfigurationOverride ?? null,
      totalWheelOverride: input.totalWheelOverride ?? null,
      wheelSizeOverride: input.wheelSizeOverride ?? null,
      resolvedSpecification: buildResolvedSpecification(base),
      updatedAt: now(),
    };
    store = [...store.slice(0, idx), updated, ...store.slice(idx + 1)];
    return delay({ data: updated });
  },

  async remove(id: string): Promise<{ data: null }> {
    await ensureSeeded();
    const idx = store.findIndex((u) => u.id === id);
    if (idx === -1) throw new ApiError("Unit not found");
    store = [...store.slice(0, idx), ...store.slice(idx + 1)];
    return delay({ data: null });
  },
};
