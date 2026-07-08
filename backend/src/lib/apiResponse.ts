import { Response } from "express";

export function ok(res: Response, data: unknown, message = "Success") {
  return res.status(200).json({ status: "success", message, data });
}

export function created(res: Response, data: unknown, message = "Created") {
  return res.status(201).json({ status: "success", message, data });
}

export function fail(res: Response, status: number, message: string, errors?: unknown) {
  return res.status(status).json({ status: "error", message, errors: errors ?? null });
}
