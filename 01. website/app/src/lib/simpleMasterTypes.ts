export interface SimpleMasterEntity {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SimpleMasterInput {
  name: string;
  isActive?: boolean;
}

export interface SimpleMasterListParams {
  query?: string;
  status?: "active" | "inactive" | "";
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
