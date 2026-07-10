import { createSimpleMasterApi } from "./createSimpleMasterApi";

export const unitTypeApi = createSimpleMasterApi("/unit-types", "Unit type", ["Dump Truck", "Excavator"]);
export type { SimpleMasterEntity as UnitType } from "./simpleMasterTypes";
