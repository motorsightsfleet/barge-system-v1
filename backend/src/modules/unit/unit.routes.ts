import { Router } from "express";
import * as unitController from "./unit.controller";

export const unitRouter = Router();

unitRouter.get("/export", unitController.exportCsv);
unitRouter.get("/", unitController.list);
unitRouter.get("/:id", unitController.getOne);
unitRouter.post("/", unitController.create);
unitRouter.put("/:id", unitController.update);
unitRouter.delete("/:id", unitController.remove);
