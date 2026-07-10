import { api } from "./api";
import type { VariantSpecification, VariantSpecificationInput, VariantSpecificationListParams, Pagination } from "./variantSpecificationTypes";
import { variantSpecificationApiMock } from "./variantSpecificationApi.mock";

export type {
  VariantSpecification,
  VariantSpecificationListParams,
  Pagination,
  VariantSpecificationInput,
  UnitTypeRef,
  UnitModelRef,
  UnitModelVariantRef,
  EngineRef,
  BrandRef,
} from "./variantSpecificationTypes";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

interface ListResponse {
  data: VariantSpecification[];
  pagination: Pagination;
}
interface ItemResponse {
  data: VariantSpecification;
}

function buildQuery(params: VariantSpecificationListParams): string {
  const search = new URLSearchParams();
  if (params.query) search.set("query", params.query);
  if (params.status) search.set("status", params.status);
  if (params.unitTypeId) search.set("unitTypeId", params.unitTypeId);
  if (params.unitModelId) search.set("unitModelId", params.unitModelId);
  if (params.engineId) search.set("engineId", params.engineId);
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 10));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  return search.toString();
}

export const variantSpecificationApi = {
  list: (params: VariantSpecificationListParams) =>
    USE_MOCK ? variantSpecificationApiMock.list(params) : api.get<ListResponse>(`/variant-specifications?${buildQuery(params)}`),
  getOne: (id: string) =>
    USE_MOCK ? variantSpecificationApiMock.getOne(id) : api.get<ItemResponse>(`/variant-specifications/${id}`),
  create: (input: VariantSpecificationInput) =>
    USE_MOCK ? variantSpecificationApiMock.create(input) : api.post<ItemResponse>("/variant-specifications", input),
  update: (id: string, input: VariantSpecificationInput) =>
    USE_MOCK ? variantSpecificationApiMock.update(id, input) : api.put<ItemResponse>(`/variant-specifications/${id}`, input),
  remove: (id: string) =>
    USE_MOCK ? variantSpecificationApiMock.remove(id) : api.delete<{ data: null }>(`/variant-specifications/${id}`),
  exportUrl: () => `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"}/variant-specifications/export`,
};
