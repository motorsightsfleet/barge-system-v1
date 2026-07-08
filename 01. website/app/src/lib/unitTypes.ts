export const UNIT_STATUSES = ["Ready for Use (RFU)", "Operating", "Under Maintenance", "Breakdown"] as const;

export interface SiteRef {
  id: string;
  name: string;
}

export interface BrandRef {
  id: string;
  name: string;
}

export interface EngineRef {
  id: string;
  name: string;
  brandId: string;
  brand: BrandRef;
}

export interface UnitTypeRef {
  id: string;
  name: string;
}

export interface UnitModelRef {
  id: string;
  name: string;
}

export interface UnitModelVariantRef {
  id: string;
  name: string;
  unitModelId: string;
}

export interface VariantSpecificationRef {
  id: string;
  unitType: UnitTypeRef;
  unitModel: UnitModelRef;
  unitModelVariant: UnitModelVariantRef;
  engine: EngineRef;
  capacityVessel: number;
  axleConfiguration: string;
  totalWheel: number;
  wheelSize: number;
  isActive: boolean;
  label: string;
}

export interface ResolvedSpecification {
  engine: EngineRef;
  capacityVessel: number;
  axleConfiguration: string;
  totalWheel: number;
  wheelSize: number;
  isOverridden: {
    engine: boolean;
    capacityVessel: boolean;
    axleConfiguration: boolean;
    totalWheel: boolean;
    wheelSize: boolean;
  };
}

export interface Unit {
  id: string;
  unitCode: string;
  siteId: string;
  site: SiteRef;
  variantSpecificationId: string;
  variantSpecification: VariantSpecificationRef;
  unitStatus: string;
  serialNumber: string;
  arriveDate: string;
  isActive: boolean;
  engineOverrideId: string | null;
  capacityVesselOverride: number | null;
  axleConfigurationOverride: string | null;
  totalWheelOverride: number | null;
  wheelSizeOverride: number | null;
  resolvedSpecification: ResolvedSpecification;
  createdAt: string;
  updatedAt: string;
}

export interface UnitListParams {
  query?: string;
  status?: "active" | "inactive" | "";
  siteId?: string;
  unitStatus?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UnitInput {
  unitCode: string;
  siteId: string;
  variantSpecificationId: string;
  unitStatus: string;
  serialNumber: string;
  arriveDate: string;
  isActive?: boolean;
  engineOverrideId?: string | null;
  capacityVesselOverride?: number | null;
  axleConfigurationOverride?: string | null;
  totalWheelOverride?: number | null;
  wheelSizeOverride?: number | null;
}
