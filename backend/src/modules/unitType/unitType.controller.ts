import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { unitTypeBodySchema, unitTypeListQuerySchema } from "./unitType.validation";
import * as unitTypeService from "./unitType.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = unitTypeListQuerySchema.parse(req.query);
    const result = await unitTypeService.listUnitTypes(query);
    return res.status(200).json({ status: "success", message: "Unit types retrieved", data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, await unitTypeService.getUnitTypeById(req.params.id), "Unit type retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = unitTypeBodySchema.parse(req.body);
    return created(res, await unitTypeService.createUnitType(body), "Unit type successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = unitTypeBodySchema.parse(req.body);
    return ok(res, await unitTypeService.updateUnitType(req.params.id, body), "Unit type successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await unitTypeService.softDeleteUnitType(req.params.id);
    return ok(res, null, "Unit type successfully deleted");
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
    const unitTypes = await unitTypeService.listUnitTypesForExport();
    const header = ["Name", "Status"];
    const rows = unitTypes.map((u) => [u.name, u.isActive ? "Active" : "Inactive"].map((v) => csvEscape(String(v))).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=unit-types.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
