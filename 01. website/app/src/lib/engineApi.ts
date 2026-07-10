import { api } from "./api";
import type { Engine, EngineInput, EngineListParams, Pagination } from "./engineTypes";
import { engineApiMock } from "./engineApi.mock";

export type { Engine, EngineListParams, Pagination, EngineInput, Brand } from "./engineTypes";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

interface ListResponse {
  data: Engine[];
  pagination: Pagination;
}
interface ItemResponse {
  data: Engine;
}

function buildQuery(params: EngineListParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  if (params.brandId) search.set("brandId", params.brandId);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}

export const engineApi = {
  list: (params: EngineListParams) =>
    USE_MOCK ? engineApiMock.list(params) : api.get<ListResponse>(`/engines?${buildQuery(params)}`),
  getOne: (id: string) => (USE_MOCK ? engineApiMock.getOne(id) : api.get<ItemResponse>(`/engines/${id}`)),
  create: (input: EngineInput) => (USE_MOCK ? engineApiMock.create(input) : api.post<ItemResponse>("/engines", input)),
  update: (id: string, input: EngineInput) =>
    USE_MOCK ? engineApiMock.update(id, input) : api.put<ItemResponse>(`/engines/${id}`, input),
  remove: (id: string) => (USE_MOCK ? engineApiMock.remove(id) : api.delete<{ data: null }>(`/engines/${id}`)),
  exportUrl: () => `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/engines/export`,
};
