import type { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { getPagination } from "../../utils/pagination";

export const userService = {
  async list(query: Record<string, unknown>) {
    const { skip, take, page, limit } = getPagination(query);
    const where = {
      email: query.search ? { contains: String(query.search), mode: "insensitive" as const } : undefined,
      status: query.status as UserStatus | undefined,
      role: query.role as Role | undefined,
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, role: true, status: true, profile: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, meta: { total, page, limit } };
  },

  getById: (id: string) =>
    prisma.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, email: true, role: true, status: true, profile: true, qualifications: true, createdAt: true },
    }),

  updateStatus: (id: string, status: UserStatus) => prisma.user.update({ where: { id }, data: { status } }),
};
