import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { unitModelBodySchema, unitModelListQuerySchema } from "./unitModel.validation";
import * as unitModelService from "./unitModel.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = unitModelListQuerySchema.parse(req.query);
    const result = await unitModelService.listUnitModels(query);
    return res.status(200).json({ status: "success", message: "Unit models retrieved", data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, await unitModelService.getUnitModelById(req.params.id), "Unit model retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = unitModelBodySchema.parse(req.body);
    return created(res, await unitModelService.createUnitModel(body), "Unit model successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = unitModelBodySchema.parse(req.body);
    return ok(res, await unitModelService.updateUnitModel(req.params.id, body), "Unit model successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await unitModelService.softDeleteUnitModel(req.params.id);
    return ok(res, null, "Unit model successfully deleted");
  } catch (err) {
    next(err);
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function exportCsv(_req: Request, res: Response, next: NextFunction) {
  try {
    const unitModels = await unitModelService.listUnitModelsForExport();
    const header = ["Name", "Status"];
    const rows = unitModels.map((u) => [u.name, u.isActive ? "Active" : "Inactive"].map((v) => csvEscape(String(v))).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=unit-models.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
