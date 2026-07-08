import { api } from "./api";
import type { Unit, UnitInput, UnitListParams, Pagination } from "./unitTypes";
import { unitApiMock } from "./unitApi.mock";

export type {
  Unit,
  UnitListParams,
  Pagination,
  UnitInput,
  SiteRef,
  EngineRef,
  BrandRef,
  UnitTypeRef,
  UnitModelRef,
  UnitModelVariantRef,
  VariantSpecificationRef,
  ResolvedSpecification,
} from "./unitTypes";
export { UNIT_STATUSES } from "./unitTypes";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

interface ListResponse {
  data: Unit[];
  pagination: Pagination;
}
interface ItemResponse {
  data: Unit;
}

function buildQuery(params: UnitListParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  if (params.siteId) search.set("siteId", params.siteId);
  if (params.unitStatus) search.set("unitStatus", params.unitStatus);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}

export const unitApi = {
  list: (params: UnitListParams) =>
    USE_MOCK ? unitApiMock.list(params) : api.get<ListResponse>(`/units?${buildQuery(params)}`),
  getOne: (id: string) => (USE_MOCK ? unitApiMock.getOne(id) : api.get<ItemResponse>(`/units/${id}`)),
  create: (input: UnitInput) => (USE_MOCK ? unitApiMock.create(input) : api.post<ItemResponse>("/units", input)),
  update: (id: string, input: UnitInput) =>
    USE_MOCK ? unitApiMock.update(id, input) : api.put<ItemResponse>(`/units/${id}`, input),
  remove: (id: string) => (USE_MOCK ? unitApiMock.remove(id) : api.delete<{ data: null }>(`/units/${id}`)),
  exportUrl: () => `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/units/export`,
};
