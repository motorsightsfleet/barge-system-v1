import { Router } from "express";
import * as unitModelController from "./unitModel.controller";

export const unitModelRouter = Router();

unitModelRouter.get("/export", unitModelController.exportCsv);
unitModelRouter.get("/", unitModelController.list);
unitModelRouter.get("/:id", unitModelController.getOne);
unitModelRouter.post("/", unitModelController.create);
unitModelRouter.put("/:id", unitModelController.update);
unitModelRouter.delete("/:id", unitModelController.remove);
