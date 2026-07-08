import { prisma } from "../../lib/prisma";

export async function listSites() {
  return prisma.site.findMany({ orderBy: { name: "asc" } });
}
