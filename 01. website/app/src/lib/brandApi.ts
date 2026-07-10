import { createSimpleMasterApi } from "./createSimpleMasterApi";

export const brandApi = createSimpleMasterApi("/brands", "Brand", ["Cummins", "Komatsu"]);
export type { SimpleMasterEntity as Brand } from "./simpleMasterTypes";
