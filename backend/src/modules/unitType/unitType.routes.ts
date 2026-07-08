import { Router } from "express";
import * as unitTypeController from "./unitType.controller";

export const unitTypeRouter = Router();

unitTypeRouter.get("/export", unitTypeController.exportCsv);
unitTypeRouter.get("/", unitTypeController.list);
unitTypeRouter.get("/:id", unitTypeController.getOne);
unitTypeRouter.post("/", unitTypeController.create);
unitTypeRouter.put("/:id", unitTypeController.update);
unitTypeRouter.delete("/:id", unitTypeController.remove);
