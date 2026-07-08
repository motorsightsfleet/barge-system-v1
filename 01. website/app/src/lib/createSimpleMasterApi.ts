import { api } from "./api";
import type { SimpleMasterEntity, SimpleMasterInput, SimpleMasterListParams, Pagination } from "./simpleMasterTypes";
import { createSimpleMasterMock } from "./createSimpleMasterMock";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

interface ListResponse {
  data: SimpleMasterEntity[];
  pagination: Pagination;
}
interface ItemResponse {
  data: SimpleMasterEntity;
}

function buildQuery(params: SimpleMasterListParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}

export function createSimpleMasterApi(resourcePath: string, entityLabel: string, seedNames: string[]) {
  const mock = createSimpleMasterMock(entityLabel, seedNames);

  return {
    list: (params: SimpleMasterListParams) =>
      USE_MOCK ? mock.list(params) : api.get<ListResponse>(`${resourcePath}?${buildQuery(params)}`),
    getOne: (id: string) => (USE_MOCK ? mock.getOne(id) : api.get<ItemResponse>(`${resourcePath}/${id}`)),
    create: (input: SimpleMasterInput) => (USE_MOCK ? mock.create(input) : api.post<ItemResponse>(resourcePath, input)),
    update: (id: string, input: SimpleMasterInput) =>
      USE_MOCK ? mock.update(id, input) : api.put<ItemResponse>(`${resourcePath}/${id}`, input),
    remove: (id: string) => (USE_MOCK ? mock.remove(id) : api.delete<{ data: null }>(`${resourcePath}/${id}`)),
    exportUrl: () => `${API_BASE_URL}${resourcePath}/export`,
  };
}
