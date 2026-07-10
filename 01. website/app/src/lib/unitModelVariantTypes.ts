export interface UnitModelRef {
  id: string;
  name: string;
}

export interface UnitModelVariant {
  id: string;
  name: string;
  unitModelId: string;
  unitModel: UnitModelRef;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnitModelVariantListParams {
  query?: string;
  status?: "active" | "inactive" | "";
  unitModelId?: string;
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

export interface UnitModelVariantInput {
  name: string;
  unitModelId: string;
  isActive?: boolean;
}
