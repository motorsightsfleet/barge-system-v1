import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { brandBodySchema, brandListQuerySchema } from "./brand.validation";
import * as brandService from "./brand.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = brandListQuerySchema.parse(req.query);
    const result = await brandService.listBrands(query);
    return res.status(200).json({ status: "success", message: "Brands retrieved", data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, await brandService.getBrandById(req.params.id), "Brand retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = brandBodySchema.parse(req.body);
    return created(res, await brandService.createBrand(body), "Brand successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = brandBodySchema.parse(req.body);
    return ok(res, await brandService.updateBrand(req.params.id, body), "Brand successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await brandService.softDeleteBrand(req.params.id);
    return ok(res, null, "Brand successfully deleted");
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
    const brands = await brandService.listBrandsForExport();
    const header = ["Name", "Status"];
    const rows = brands.map((b) => [b.name, b.isActive ? "Active" : "Inactive"].map((v) => csvEscape(String(v))).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=brands.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
