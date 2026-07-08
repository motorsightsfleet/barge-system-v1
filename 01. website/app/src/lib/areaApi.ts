import { api } from "./api";
import type { Area, AreaInput, AreaListParams, Pagination } from "./areaTypes";
import { areaApiMock } from "./areaApi.mock";

export type { Site, Area, AreaListParams, Pagination, AreaInput } from "./areaTypes";
export { AREA_CATEGORIES } from "./areaTypes";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

interface ListResponse {
  data: Area[];
  pagination: Pagination;
}

interface ItemResponse {
  data: Area;
}

function buildQuery(params: AreaListParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  if (params.siteId) search.set("siteId", params.siteId);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}

export const areaApi = {
  list: (params: AreaListParams) =>
    USE_MOCK ? areaApiMock.list(params) : api.get<ListResponse>(`/areas?${buildQuery(params)}`),
  getOne: (id: string) => (USE_MOCK ? areaApiMock.getOne(id) : api.get<ItemResponse>(`/areas/${id}`)),
  create: (input: AreaInput) => (USE_MOCK ? areaApiMock.create(input) : api.post<ItemResponse>("/areas", input)),
  update: (id: string, input: AreaInput) =>
    USE_MOCK ? areaApiMock.update(id, input) : api.put<ItemResponse>(`/areas/${id}`, input),
  remove: (id: string) => (USE_MOCK ? areaApiMock.remove(id) : api.delete<{ data: null }>(`/areas/${id}`)),
  exportUrl: () => `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/areas/export`,
};
