import type { Fleet } from "@prisma/client";
import { prisma } from "../../config/database";

export const qualificationService = {
  listMine: (userId: string) => prisma.userQualification.findMany({ where: { userId } }),

  async replaceMine(userId: string, fleets: Fleet[]) {
    return prisma.$transaction(async (tx) => {
      await tx.userQualification.deleteMany({ where: { userId } });
      if (fleets.length) {
        await tx.userQualification.createMany({ data: fleets.map((fleet) => ({ userId, fleet })) });
      }
      return tx.userQualification.findMany({ where: { userId } });
    });
  },
};
