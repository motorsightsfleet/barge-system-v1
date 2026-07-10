import { api } from "./api";
import type { Barge, BargeInput, BargeListParams, Pagination } from "./bargeTypes";
import { bargeApiMock } from "./bargeApi.mock";

export type { BargeStatus, Barge, BargeListParams, Pagination, BargeInput } from "./bargeTypes";
export { BARGE_TYPES } from "./bargeTypes";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

interface ListResponse {
  data: Barge[];
  pagination: Pagination;
}

interface ItemResponse {
  data: Barge;
}

function buildQuery(params: BargeListParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  if (params.type) search.set("type", params.type);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}

export const bargeApi = {
  list: (params: BargeListParams) =>
    USE_MOCK ? bargeApiMock.list(params) : api.get<ListResponse>(`/barges?${buildQuery(params)}`),
  getOne: (id: string) => (USE_MOCK ? bargeApiMock.getOne(id) : api.get<ItemResponse>(`/barges/${id}`)),
  create: (input: BargeInput) => (USE_MOCK ? bargeApiMock.create(input) : api.post<ItemResponse>("/barges", input)),
  update: (id: string, input: BargeInput) =>
    USE_MOCK ? bargeApiMock.update(id, input) : api.put<ItemResponse>(`/barges/${id}`, input),
  remove: (id: string) => (USE_MOCK ? bargeApiMock.remove(id) : api.delete<{ data: null }>(`/barges/${id}`)),
  exportUrl: () => `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/barges/export`,
};
