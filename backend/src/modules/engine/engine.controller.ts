import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { engineBodySchema, engineListQuerySchema } from "./engine.validation";
import * as engineService from "./engine.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = engineListQuerySchema.parse(req.query);
    const result = await engineService.listEngines(query);
    return res.status(200).json({ status: "success", message: "Engines retrieved", data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, await engineService.getEngineById(req.params.id), "Engine retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = engineBodySchema.parse(req.body);
    return created(res, await engineService.createEngine(body), "Engine successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = engineBodySchema.parse(req.body);
    return ok(res, await engineService.updateEngine(req.params.id, body), "Engine successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await engineService.softDeleteEngine(req.params.id);
    return ok(res, null, "Engine successfully deleted");
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
    const engines = await engineService.listEnginesForExport();
    const header = ["Name", "Brand", "Status"];
    const rows = engines.map((e) => [e.name, e.brand.name, e.isActive ? "Active" : "Inactive"].map((v) => csvEscape(String(v))).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=engines.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
