export type BargeStatus = "AVAILABLE" | "UNAVAILABLE";

export const BARGE_TYPES = ["Nickel Carrier", "Coal Carrier"] as const;

export interface Barge {
  id: string;
  code: string;
  name: string;
  owner: string;
  capacityMt: number;
  type: string;
  status: BargeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BargeListParams {
  query?: string;
  status?: BargeStatus | "";
  type?: string;
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

export interface BargeInput {
  name: string;
  owner: string;
  capacityMt: number;
  type: string;
  status?: BargeStatus;
}
