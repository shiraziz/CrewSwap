import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export const accommodationService = {
  list: () => prisma.accommodation.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  create: (data: Prisma.AccommodationCreateInput) => prisma.accommodation.create({ data }),
  update: (id: string, data: Prisma.AccommodationUpdateInput) => prisma.accommodation.update({ where: { id }, data }),
};
