export const AREA_CATEGORIES = ["Loading", "Unloading", "Anchorage"] as const;

export interface Site {
  id: string;
  name: string;
}

export interface Area {
  id: string;
  areaName: string;
  siteId: string;
  site: Site;
  category: string;
  polygonCoordinates: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AreaListParams {
  query?: string;
  status?: "active" | "inactive" | "";
  siteId?: string;
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

export interface AreaInput {
  areaName: string;
  siteId: string;
  category: string;
  polygonCoordinates: string;
  isActive?: boolean;
}
