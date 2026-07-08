import { Router } from "express";
import * as shiftController from "./shift.controller";

export const shiftRouter = Router();

shiftRouter.get("/export", shiftController.exportCsv);
shiftRouter.get("/", shiftController.list);
shiftRouter.get("/:id", shiftController.getOne);
shiftRouter.post("/", shiftController.create);
shiftRouter.put("/:id", shiftController.update);
shiftRouter.delete("/:id", shiftController.remove);
