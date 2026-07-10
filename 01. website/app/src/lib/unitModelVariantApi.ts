import { api } from "./api";
import type { UnitModelVariant, UnitModelVariantInput, UnitModelVariantListParams, Pagination } from "./unitModelVariantTypes";
import { unitModelVariantApiMock } from "./unitModelVariantApi.mock";

export type { UnitModelVariant, UnitModelVariantListParams, Pagination, UnitModelVariantInput, UnitModelRef } from "./unitModelVariantTypes";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

interface ListResponse {
  data: UnitModelVariant[];
  pagination: Pagination;
}
interface ItemResponse {
  data: UnitModelVariant;
}

function buildQuery(params: UnitModelVariantListParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  if (params.unitModelId) search.set("unitModelId", params.unitModelId);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}

export const unitModelVariantApi = {
  list: (params: UnitModelVariantListParams) =>
    USE_MOCK ? unitModelVariantApiMock.list(params) : api.get<ListResponse>(`/unit-model-variants?${buildQuery(params)}`),
  getOne: (id: string) => (USE_MOCK ? unitModelVariantApiMock.getOne(id) : api.get<ItemResponse>(`/unit-model-variants/${id}`)),
  create: (input: UnitModelVariantInput) =>
    USE_MOCK ? unitModelVariantApiMock.create(input) : api.post<ItemResponse>("/unit-model-variants", input),
  update: (id: string, input: UnitModelVariantInput) =>
    USE_MOCK ? unitModelVariantApiMock.update(id, input) : api.put<ItemResponse>(`/unit-model-variants/${id}`, input),
  remove: (id: string) =>
    USE_MOCK ? unitModelVariantApiMock.remove(id) : api.delete<{ data: null }>(`/unit-model-variants/${id}`),
  exportUrl: () => `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/unit-model-variants/export`,
};
