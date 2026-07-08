import { api } from "./api";
import type { Shift, ShiftInput, ShiftListParams, Pagination } from "./shiftTypes";
import { shiftApiMock } from "./shiftApi.mock";

export type { Shift, ShiftListParams, Pagination, ShiftInput } from "./shiftTypes";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

interface ListResponse {
  data: Shift[];
  pagination: Pagination;
}

interface ItemResponse {
  data: Shift;
}

function buildQuery(params: ShiftListParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}

export const shiftApi = {
  list: (params: ShiftListParams) =>
    USE_MOCK ? shiftApiMock.list(params) : api.get<ListResponse>(`/shifts?${buildQuery(params)}`),
  getOne: (id: string) => (USE_MOCK ? shiftApiMock.getOne(id) : api.get<ItemResponse>(`/shifts/${id}`)),
  create: (input: ShiftInput) => (USE_MOCK ? shiftApiMock.create(input) : api.post<ItemResponse>("/shifts", input)),
  update: (id: string, input: ShiftInput) =>
    USE_MOCK ? shiftApiMock.update(id, input) : api.put<ItemResponse>(`/shifts/${id}`, input),
  remove: (id: string) => (USE_MOCK ? shiftApiMock.remove(id) : api.delete<{ data: null }>(`/shifts/${id}`)),
  exportUrl: () => `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/shifts/export`,
};
