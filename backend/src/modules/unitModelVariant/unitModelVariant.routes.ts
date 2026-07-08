import { Router } from "express";
import * as unitModelVariantController from "./unitModelVariant.controller";

export const unitModelVariantRouter = Router();

unitModelVariantRouter.get("/export", unitModelVariantController.exportCsv);
unitModelVariantRouter.get("/", unitModelVariantController.list);
unitModelVariantRouter.get("/:id", unitModelVariantController.getOne);
unitModelVariantRouter.post("/", unitModelVariantController.create);
unitModelVariantRouter.put("/:id", unitModelVariantController.update);
unitModelVariantRouter.delete("/:id", unitModelVariantController.remove);
