export interface Brand {
  id: string;
  name: string;
}

export interface Engine {
  id: string;
  name: string;
  brandId: string;
  brand: Brand;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EngineListParams {
  query?: string;
  status?: "active" | "inactive" | "";
  brandId?: string;
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

export interface EngineInput {
  name: string;
  brandId: string;
  isActive?: boolean;
}
