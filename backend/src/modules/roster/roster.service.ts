import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export const rosterService = {
  list(ownerId: string, query: { from?: Date; to?: Date }) {
    return prisma.rosterItem.findMany({
      where: {
        ownerId,
        startsAt: query.from ? { gte: query.from } : undefined,
        endsAt: query.to ? { lte: query.to } : undefined,
      },
      include: { flight: true },
      orderBy: { startsAt: "asc" },
    });
  },
  get(ownerId: string, id: string) {
    return prisma.rosterItem.findFirstOrThrow({ where: { id, ownerId }, include: { flight: true } });
  },
  create(ownerId: string, data: Omit<Prisma.RosterItemUncheckedCreateInput, "id" | "ownerId" | "createdAt" | "updatedAt">) {
    return prisma.rosterItem.create({ data: { ...data, ownerId } });
  },
  sync(ownerId: string) {
    return { ownerId, synced: true, message: "External roster sync hook ready" };
  },
};
