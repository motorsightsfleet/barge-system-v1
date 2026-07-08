import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { unitModelVariantBodySchema, unitModelVariantListQuerySchema } from "./unitModelVariant.validation";
import * as unitModelVariantService from "./unitModelVariant.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = unitModelVariantListQuerySchema.parse(req.query);
    const result = await unitModelVariantService.listUnitModelVariants(query);
    return res.status(200).json({ status: "success", message: "Unit model variants retrieved", data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, await unitModelVariantService.getUnitModelVariantById(req.params.id), "Unit model variant retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = unitModelVariantBodySchema.parse(req.body);
    return created(res, await unitModelVariantService.createUnitModelVariant(body), "Unit model variant successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = unitModelVariantBodySchema.parse(req.body);
    return ok(res, await unitModelVariantService.updateUnitModelVariant(req.params.id, body), "Unit model variant successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await unitModelVariantService.softDeleteUnitModelVariant(req.params.id);
    return ok(res, null, "Unit model variant successfully deleted");
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
    const variants = await unitModelVariantService.listUnitModelVariantsForExport();
    const header = ["Name", "Unit Model", "Status"];
    const rows = variants.map((v) => [v.name, v.unitModel.name, v.isActive ? "Active" : "Inactive"].map((val) => csvEscape(String(val))).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=unit-model-variants.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
