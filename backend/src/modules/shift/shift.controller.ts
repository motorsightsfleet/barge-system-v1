import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { shiftBodySchema, shiftListQuerySchema } from "./shift.validation";
import * as shiftService from "./shift.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = shiftListQuerySchema.parse(req.query);
    const result = await shiftService.listShifts(query);
    return res.status(200).json({
      status: "success",
      message: "Shifts retrieved",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const shift = await shiftService.getShiftById(req.params.id);
    return ok(res, shift, "Shift retrieved");
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = shiftBodySchema.parse(req.body);
    const shift = await shiftService.createShift(body);
    return created(res, shift, "Shift successfully created");
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const body = shiftBodySchema.parse(req.body);
    const shift = await shiftService.updateShift(req.params.id, body);
    return ok(res, shift, "Shift successfully updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await shiftService.softDeleteShift(req.params.id);
    return ok(res, null, "Shift successfully deleted");
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
    const shifts = await shiftService.listShiftsForExport();
    const header = ["Shift Name", "Shift Start", "Shift End", "Status"];
    const rows = shifts.map((s) =>
      [s.shiftName, s.shiftStart, s.shiftEnd, s.isActive ? "Active" : "Inactive"].map((v) => csvEscape(String(v))).join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=shifts.csv");
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}
