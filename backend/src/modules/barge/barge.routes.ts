import { Router } from "express";
import * as bargeController from "./barge.controller";

export const bargeRouter = Router();

bargeRouter.get("/", bargeController.list);
bargeRouter.get("/:id", bargeController.getOne);
bargeRouter.post("/", bargeController.create);
bargeRouter.put("/:id", bargeController.update);
bargeRouter.delete("/:id", bargeController.remove);
