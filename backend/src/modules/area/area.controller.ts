import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { AREA_CATEGORIES } from "./area.constants";
import { areaBodySchema, areaListQuerySchema } from "./area.validation";
import * as areaService from "./area.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = areaListQuerySchema.parse(req.query);
    const result = await areaService.listAreas(query);
    return res.status(200).json({
      status: "success",
      message: "Areas retrieved",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const area = await areaService.getAreaById(req.params.id);
    return ok(res, area, "Area retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = areaBodySchema.parse(req.body);
    const area = await areaService.createArea(body);
    return created(res, area, "Area successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = areaBodySchema.parse(req.body);
    const area = await areaService.updateArea(req.params.id, body);
    return ok(res, area, "Area successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await areaService.softDeleteArea(req.params.id);
    return ok(res, null, "Area successfully deleted");
  } catch (err) {
    next(err);
  }
}

export async function categories(_req: Request, res: Response) {
  return ok(res, AREA_CATEGORIES, "Categories retrieved");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function exportCsv(_req: Request, res: Response, next: NextFunction) {
  try {
    const areas = await areaService.listAreasForExport();
    const header = ["Area Name", "Site", "Category", "Status", "Polygon Coordinates"];
    const rows = areas.map((a) =>
      [a.areaName, a.site.name, a.category, a.isActive ? "Active" : "Inactive", a.polygonCoordinates]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=areas.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
