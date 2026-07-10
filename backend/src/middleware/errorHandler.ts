import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/AppError";
import { fail } from "../lib/apiResponse";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return fail(res, 400, errors[0]?.message ?? "Validation failed", errors);
  }

  if (err instanceof AppError) {
    return fail(res, err.status, err.message, err.errors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return fail(res, 409, "A record with this value already exists");
    }
    if (err.code === "P2025") {
      return fail(res, 404, "Data not found");
    }
  }

  console.error(err);
  return fail(res, 500, "Internal server error");
}
