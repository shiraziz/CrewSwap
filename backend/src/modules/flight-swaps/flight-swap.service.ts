import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/database";
import { badRequest, notFound } from "../../utils/errors";
import { isPast } from "../../utils/dates";
import { auditService } from "../common/audit.service";
import { ensureOwnerOrAdmin } from "../common/swap-utils";
import { matchService } from "../matches/match.service";

export const flightSwapService = {
  listOpen: () => prisma.flightSwap.findMany({ where: { status: "OPEN", flightDate: { gte: new Date() } }, include: { owner: { include: { profile: true, qualifications: true } }, flight: true } }),
  mine: (ownerId: string) => prisma.flightSwap.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" }, include: { flight: true } }),

  async create(ownerId: string, data: Omit<Prisma.FlightSwapUncheckedCreateInput, "id" | "ownerId" | "status" | "createdAt" | "updatedAt">) {
    const flight = await prisma.flight.findFirst({ where: { id: (data as { flightId: string }).flightId, ownerId } });
    if (!flight) throw notFound("Flight not found for current user");
    const swap = await prisma.flightSwap.create({ data: { ...(data as object), ownerId, status: "DRAFT" } as never });
    await auditService.log("CREATE_SWAP", "FlightSwap", { actorId: ownerId, entityId: swap.id });
    return swap;
  },

  async get(id: string) {
    return prisma.flightSwap.findUniqueOrThrow({ where: { id }, include: { flight: true, owner: { include: { profile: true, qualifications: true } } } });
  },

  async update(id: string, user: { id: string; role: Role }, data: Prisma.FlightSwapUpdateInput) {
    const swap = await prisma.flightSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    if (["CANCELLED", "COMPLETED", "ACCEPTED"].includes(swap.status)) throw badRequest("Finalized swap cannot be modified");
    const updated = await prisma.flightSwap.update({ where: { id }, data });
    await auditService.log("UPDATE_SWAP", "FlightSwap", { actorId: user.id, entityId: id });
    return updated;
  },

  async publish(id: string, user: { id: string; role: Role }) {
    const swap = await prisma.flightSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    if (swap.status !== "DRAFT") throw badRequest("Only DRAFT swaps can be published");
    if (isPast(swap.flightDate)) throw badRequest("Expired flight swap cannot be published");
    const updated = await prisma.flightSwap.update({ where: { id }, data: { status: "OPEN" } });
    await matchService.recompute("FLIGHT");
    return updated;
  },

  async cancel(id: string, user: { id: string; role: Role }) {
    const swap = await prisma.flightSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    const updated = await prisma.flightSwap.update({ where: { id }, data: { status: "CANCELLED" } });
    await auditService.log("CANCEL_SWAP", "FlightSwap", { actorId: user.id, entityId: id });
    return updated;
  },
};
