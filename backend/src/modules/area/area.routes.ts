import { Router } from "express";
import * as areaController from "./area.controller";

export const areaRouter = Router();

areaRouter.get("/categories", areaController.categories);
areaRouter.get("/export", areaController.exportCsv);
areaRouter.get("/", areaController.list);
areaRouter.get("/:id", areaController.getOne);
areaRouter.post("/", areaController.create);
areaRouter.put("/:id", areaController.update);
areaRouter.delete("/:id", areaController.remove);
