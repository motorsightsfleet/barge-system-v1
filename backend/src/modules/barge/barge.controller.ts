import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { bargeBodySchema, bargeListQuerySchema } from "./barge.validation";
import * as bargeService from "./barge.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = bargeListQuerySchema.parse(req.query);
    const result = await bargeService.listBarges(query);
    return res.status(200).json({
      status: "success",
      message: "Barges retrieved",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const barge = await bargeService.getBargeById(req.params.id);
    return ok(res, barge, "Barge retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = bargeBodySchema.parse(req.body);
    const barge = await bargeService.createBarge(body);
    return created(res, barge, "Barge created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = bargeBodySchema.parse(req.body);
    const barge = await bargeService.updateBarge(req.params.id, body);
    return ok(res, barge, "Barge updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await bargeService.softDeleteBarge(req.params.id);
    return ok(res, null, "Barge deleted");
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
    const barges = await bargeService.listBargesForExport();
    const header = ["Barge Code", "Barge Name", "Barge Owner", "Capacity", "Type", "Status"];
    const rows = barges.map((b) =>
      [b.code, b.name, b.owner, b.capacityMt, b.type, b.status]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=barges.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
