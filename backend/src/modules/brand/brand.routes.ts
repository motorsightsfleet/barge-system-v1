import { Router } from "express";
import * as brandController from "./brand.controller";

export const brandRouter = Router();

brandRouter.get("/export", brandController.exportCsv);
brandRouter.get("/", brandController.list);
brandRouter.get("/:id", brandController.getOne);
brandRouter.post("/", brandController.create);
brandRouter.put("/:id", brandController.update);
brandRouter.delete("/:id", brandController.remove);
