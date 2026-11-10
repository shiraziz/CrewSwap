import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/database";
import { badRequest } from "../../utils/errors";
import { isPast } from "../../utils/dates";
import { auditService } from "../common/audit.service";
import { ensureOwnerOrAdmin } from "../common/swap-utils";
import { matchService } from "../matches/match.service";

const validateRange = (start: Date, end: Date) => {
  if (end <= start) throw badRequest("Leave end date must be after start date");
};

export const leaveSwapService = {
  listOpen: () => prisma.leaveSwap.findMany({ where: { status: "OPEN", currentStart: { gte: new Date() } }, include: { owner: { include: { profile: true } } } }),
  mine: (ownerId: string) => prisma.leaveSwap.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } }),
  async create(
    ownerId: string,
    data: { currentStart: Date; currentEnd: Date; desiredStart: Date; desiredEnd: Date; note?: string },
  ) {
    validateRange(data.currentStart, data.currentEnd);
    validateRange(data.desiredStart, data.desiredEnd);
    const swap = await prisma.leaveSwap.create({ data: { ...data, ownerId, status: "DRAFT" } });
    await auditService.log("CREATE_SWAP", "LeaveSwap", { actorId: ownerId, entityId: swap.id });
    return swap;
  },
  get: (id: string) => prisma.leaveSwap.findUniqueOrThrow({ where: { id }, include: { owner: { include: { profile: true } } } }),
  async update(id: string, user: { id: string; role: Role }, data: Prisma.LeaveSwapUpdateInput) {
    const swap = await prisma.leaveSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    if (["CANCELLED", "COMPLETED", "ACCEPTED"].includes(swap.status)) throw badRequest("Finalized swap cannot be modified");
    return prisma.leaveSwap.update({ where: { id }, data });
  },
  async publish(id: string, user: { id: string; role: Role }) {
    const swap = await prisma.leaveSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    if (swap.status !== "DRAFT") throw badRequest("Only DRAFT swaps can be published");
    if (isPast(swap.currentStart)) throw badRequest("Expired leave swap cannot be published");
    const updated = await prisma.leaveSwap.update({ where: { id }, data: { status: "OPEN" } });
    await matchService.recompute("LEAVE");
    return updated;
  },
  async cancel(id: string, user: { id: string; role: Role }) {
    const swap = await prisma.leaveSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    const updated = await prisma.leaveSwap.update({ where: { id }, data: { status: "CANCELLED" } });
    await auditService.log("CANCEL_SWAP", "LeaveSwap", { actorId: user.id, entityId: id });
    return updated;
  },
};
