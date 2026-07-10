import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import {
  variantSpecificationBodySchema,
  variantSpecificationListQuerySchema,
} from "./variantSpecification.validation";
import * as variantSpecificationService from "./variantSpecification.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = variantSpecificationListQuerySchema.parse(req.query);
    const result = await variantSpecificationService.listVariantSpecifications(query);
    return res.status(200).json({
      status: "success",
      message: "Variant specifications retrieved",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    return ok(res, await variantSpecificationService.getVariantSpecificationById(req.params.id), "Variant specification retrieved");
  } catch (err) {
    next(err);
  }
}

function parseBody(req: Request) {
  return variantSpecificationBodySchema.parse({
    ...req.body,
    capacityVessel: req.body.capacityVessel !== undefined ? Number(req.body.capacityVessel) : undefined,
    totalWheel: req.body.totalWheel !== undefined ? Number(req.body.totalWheel) : undefined,
    wheelSize: req.body.wheelSize !== undefined ? Number(req.body.wheelSize) : undefined,
  });
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = parseBody(req);
    return created(res, await variantSpecificationService.createVariantSpecification(body), "Variant specification successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = parseBody(req);
    return ok(res, await variantSpecificationService.updateVariantSpecification(req.params.id, body), "Variant specification successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await variantSpecificationService.softDeleteVariantSpecification(req.params.id);
    return ok(res, null, "Variant specification successfully deleted");
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
    const specs = await variantSpecificationService.listVariantSpecificationsForExport();
    const header = ["Variant Specification", "Capacity Vessel", "Axle Configuration", "Total Wheel", "Wheel Size", "Status"];
    const rows = specs.map((s) =>
      [s.label, s.capacityVessel, s.axleConfiguration, s.totalWheel, s.wheelSize, s.isActive ? "Active" : "Inactive"]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=variant-specifications.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
