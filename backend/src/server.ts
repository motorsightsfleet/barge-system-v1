import "dotenv/config";
import cors from "cors";
import express from "express";
import { bargeRouter } from "./modules/barge/barge.routes";
import { areaRouter } from "./modules/area/area.routes";
import { siteRouter } from "./modules/site/site.routes";
import { shiftRouter } from "./modules/shift/shift.routes";
import { createReferenceDataRouter } from "./modules/referenceData/referenceData.routes";
import { engineRouter } from "./modules/engine/engine.routes";
import { unitModelVariantRouter } from "./modules/unitModelVariant/unitModelVariant.routes";
import { variantSpecificationRouter } from "./modules/variantSpecification/variantSpecification.routes";
import { unitRouter } from "./modules/unit/unit.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "success", message: "OK" }));
app.use("/api/barges", bargeRouter);
app.use("/api/areas", areaRouter);
app.use("/api/sites", siteRouter);
app.use("/api/shifts", shiftRouter);
// Brand / Unit Type / Unit Model are structurally identical (name + isActive) and share
// one generic module (see modules/referenceData). Legacy per-type paths are preserved so
// Engine and Variant Specification, which reference them, don't need to change.
app.use("/api/brands", createReferenceDataRouter("brand"));
app.use("/api/unit-types", createReferenceDataRouter("unit-type"));
app.use("/api/unit-models", createReferenceDataRouter("unit-model"));
app.use("/api/reference-data", createReferenceDataRouter());
app.use("/api/engines", engineRouter);
app.use("/api/unit-model-variants", unitModelVariantRouter);
app.use("/api/variant-specifications", variantSpecificationRouter);
app.use("/api/units", unitRouter);

app.use((_req, res) => {
  res.status(404).json({ status: "error", message: "Route not found", errors: null });
});

app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`Barge system backend listening on port ${port}`));
