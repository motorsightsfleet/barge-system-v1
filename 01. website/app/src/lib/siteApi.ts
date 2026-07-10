import { api } from "./api";
import type { Site } from "./areaTypes";
import { siteApiMock } from "./siteApi.mock";

const USE_MOCK = import.meta.env.VITE_MOCK_API === "true";

export const siteApi = {
  list: () => (USE_MOCK ? siteApiMock.list() : api.get<{ data: Site[] }>("/sites")),
};
