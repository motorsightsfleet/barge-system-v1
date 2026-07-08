import { Router } from "express";
import { createReferenceDataController } from "./referenceData.controller";
import type { ReferenceDataType } from "./referenceData.constants";

// fixedType: mount at a legacy per-type path (e.g. /api/brands) preserving the exact
// same routes/behavior as the old dedicated brand/unitType/unitModel modules.
// omitted: mount the consolidated router at /api/reference-data, type read from the URL.
export function createReferenceDataRouter(fixedType?: ReferenceDataType) {
  const router = Router();
  const controller = createReferenceDataController(fixedType);

  if (fixedType) {
    router.get("/export", controller.exportCsv);
    router.get("/", controller.list);
    router.get("/:id", controller.getOne);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.remove);
  } else {
    router.get("/:type/export", controller.exportCsv);
    router.get("/:type", controller.list);
    router.get("/:type/:id", controller.getOne);
    router.post("/:type", controller.create);
    router.put("/:type/:id", controller.update);
    router.delete("/:type/:id", controller.remove);
  }

  return router;
}
