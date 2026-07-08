import type { Site } from "./areaTypes";

export const MOCK_SITES: Site[] = [
  { id: "site-bunta", name: "Bunta" },
  { id: "site-buleleng", name: "Buleleng" },
  { id: "site-kabaena", name: "Kabaena" },
];

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const siteApiMock = {
  list: () => delay({ data: MOCK_SITES }),
};
