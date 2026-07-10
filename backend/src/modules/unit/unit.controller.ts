import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { unitBodySchema, unitListQuerySchema } from "./unit.validation";
import * as unitService from "./unit.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = unitListQuerySchema.parse(req.query);
    const result = await unitService.listUnits(query);
    return res.status(200).json({ status: "success", message: "Units retrieved", data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, await unitService.getUnitById(req.params.id), "Unit retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = unitBodySchema.parse(req.body);
    return created(res, await unitService.createUnit(body), "Unit successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = unitBodySchema.parse(req.body);
    return ok(res, await unitService.updateUnit(req.params.id, body), "Unit successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await unitService.softDeleteUnit(req.params.id);
    return ok(res, null, "Unit successfully deleted");
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
    const units = await unitService.listUnitsForExport();
    const header = ["Unit Code", "Unit Type", "Serial Number", "Site", "Commissioning Status", "Arrive Date", "Status"];
    const rows = units.map((u) =>
      [
        u.unitCode,
        u.variantSpecification.unitType.name,
        u.serialNumber,
        u.site.name,
        u.unitStatus,
        u.arriveDate.toISOString().split("T")[0],
        u.isActive ? "Active" : "Inactive",
      ]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=units.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
