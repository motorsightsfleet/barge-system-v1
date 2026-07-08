import { Router } from "express";
import * as variantSpecificationController from "./variantSpecification.controller";

export const variantSpecificationRouter = Router();

variantSpecificationRouter.get("/export", variantSpecificationController.exportCsv);
variantSpecificationRouter.get("/", variantSpecificationController.list);
variantSpecificationRouter.get("/:id", variantSpecificationController.getOne);
variantSpecificationRouter.post("/", variantSpecificationController.create);
variantSpecificationRouter.put("/:id", variantSpecificationController.update);
variantSpecificationRouter.delete("/:id", variantSpecificationController.remove);
