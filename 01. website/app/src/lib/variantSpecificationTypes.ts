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

export interface VariantSpecification {
  id: string;
  unitTypeId: string;
  unitType: UnitTypeRef;
  unitModelId: string;
  unitModel: UnitModelRef;
  unitModelVariantId: string;
  unitModelVariant: UnitModelVariantRef;
  engineId: string;
  engine: EngineRef;
  capacityVessel: number;
  axleConfiguration: string;
  totalWheel: number;
  wheelSize: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  label: string;
}

export interface VariantSpecificationListParams {
  query?: string;
  status?: "active" | "inactive" | "";
  unitTypeId?: string;
  unitModelId?: string;
  engineId?: string;
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

export interface VariantSpecificationInput {
  unitTypeId: string;
  unitModelId: string;
  unitModelVariantId: string;
  engineId: string;
  capacityVessel: number | undefined;
  axleConfiguration: string;
  totalWheel: number | undefined;
  wheelSize: number | undefined;
  isActive?: boolean;
}
