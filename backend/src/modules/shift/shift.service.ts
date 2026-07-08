import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { shiftBodySchema, shiftListQuerySchema } from "./shift.validation";

type ShiftInput = z.infer<typeof shiftBodySchema>;
type ShiftListQuery = z.infer<typeof shiftListQuerySchema>;

async function assertNameNotTaken(shiftName: string, excludeId?: string) {
  const existing = await prisma.shift.findFirst({
    where: { shiftName, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw AppError.conflict("Shift name already exists");
}

export async function listShifts(query: ShiftListQuery) {
  const { query: search, status, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.ShiftWhereInput = {
    deletedAt: null,
    ...(status ? { isActive: status === "active" } : {}),
    ...(search ? { shiftName: { contains: search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.shift.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.shift.count({ where }),
  ]);

  return {
    data,
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function getShiftById(id: string) {
  const shift = await prisma.shift.findFirst({ where: { id, deletedAt: null } });
  if (!shift) throw AppError.notFound("Shift not found");
  return shift;
}

export async function createShift(input: ShiftInput) {
  const parsed = shiftBodySchema.parse(input);
  await assertNameNotTaken(parsed.shiftName);

  return prisma.shift.create({
    data: {
      shiftName: parsed.shiftName,
      shiftStart: parsed.shiftStart,
      shiftEnd: parsed.shiftEnd,
      isActive: parsed.isActive ?? true,
    },
  });
}

export async function updateShift(id: string, input: ShiftInput) {
  await getShiftById(id);
  const parsed = shiftBodySchema.parse(input);
  await assertNameNotTaken(parsed.shiftName, id);

  return prisma.shift.update({
    where: { id },
    data: {
      shiftName: parsed.shiftName,
      shiftStart: parsed.shiftStart,
      shiftEnd: parsed.shiftEnd,
      isActive: parsed.isActive ?? true,
    },
  });
}

export async function softDeleteShift(id: string) {
  await getShiftById(id);
  await prisma.shift.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function listShiftsForExport() {
  return prisma.shift.findMany({ where: { deletedAt: null }, orderBy: { shiftName: "asc" } });
}
