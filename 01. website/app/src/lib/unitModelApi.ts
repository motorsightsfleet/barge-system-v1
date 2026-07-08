import { createSimpleMasterApi } from "./createSimpleMasterApi";

export const unitModelApi = createSimpleMasterApi("/unit-models", "Unit model", ["MS700", "PC2000"]);
export type { SimpleMasterEntity as UnitModel } from "./simpleMasterTypes";
