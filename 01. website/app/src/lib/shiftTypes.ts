export interface Shift {
  id: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftListParams {
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

export interface ShiftInput {
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  isActive?: boolean;
}
