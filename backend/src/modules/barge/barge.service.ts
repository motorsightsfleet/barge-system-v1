import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { BARGE_CODE_PREFIX } from "./barge.constants";
import { bargeBodySchema, bargeListQuerySchema } from "./barge.validation";

type BargeInput = z.infer<typeof bargeBodySchema>;
type BargeListQuery = z.infer<typeof bargeListQuerySchema>;

async function generateNextCode(): Promise<string> {
  const existing = await prisma.barge.findMany({
    where: { code: { startsWith: BARGE_CODE_PREFIX } },
    select: { code: true },
  });

  const maxNumber = existing.reduce((max, { code }) => {
    const match = code.match(/^MS-BS-(\d+)$/);
    if (!match) return max;
    return Math.max(max, parseInt(match[1], 10));
  }, 0);

  const nextNumber = maxNumber + 1;
  return `${BARGE_CODE_PREFIX}${String(nextNumber).padStart(3, "0")}`;
}

export async function listBarges(query: BargeListQuery) {
  const { query: search, status, type, page, pageSize, sortBy, sortDir } = query;

  const where: Prisma.BargeWhereInput = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { owner: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.barge.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.barge.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getBargeById(id: string) {
  const barge = await prisma.barge.findFirst({ where: { id, deletedAt: null } });
  if (!barge) throw AppError.notFound("Barge not found");
  return barge;
}

export async function createBarge(input: BargeInput) {
  const parsed = bargeBodySchema.parse(input);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = await generateNextCode();
    try {
      return await prisma.barge.create({
        data: {
          code,
          name: parsed.name,
          owner: parsed.owner,
          capacityMt: parsed.capacityMt,
          type: parsed.type,
          status: parsed.status ?? "AVAILABLE",
        },
      });
    } catch (err) {
      const isUniqueCodeClash =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isUniqueCodeClash || attempt === 4) throw err;
      // Another request grabbed this code concurrently — retry with the next one.
    }
  }
  throw AppError.badRequest("Failed to generate a unique barge code, please try again");
}

export async function updateBarge(id: string, input: BargeInput) {
  await getBargeById(id);
  const parsed = bargeBodySchema.parse(input);

  return prisma.barge.update({
    where: { id },
    data: {
      name: parsed.name,
      owner: parsed.owner,
      capacityMt: parsed.capacityMt,
      type: parsed.type,
      status: parsed.status ?? "AVAILABLE",
    },
  });
}

export async function softDeleteBarge(id: string) {
  await getBargeById(id);
  await prisma.barge.update({ where: { id }, data: { deletedAt: new Date() } });
}
