import { Router } from "express";
import * as engineController from "./engine.controller";

export const engineRouter = Router();

engineRouter.get("/export", engineController.exportCsv);
engineRouter.get("/", engineController.list);
engineRouter.get("/:id", engineController.getOne);
engineRouter.post("/", engineController.create);
engineRouter.put("/:id", engineController.update);
engineRouter.delete("/:id", engineController.remove);
