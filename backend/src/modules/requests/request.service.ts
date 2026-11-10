import { prisma } from "../../config/database";
import { badRequest, forbidden } from "../../utils/errors";
import { auditService } from "../common/audit.service";
import { ensurePendingRequest, ensureSwappableStatus } from "../common/swap-utils";

const getMatchOwners = (match: Awaited<ReturnType<typeof requestService.getMatch>>) => {
  const a =
    match.flightSwapA?.ownerId ??
    match.leaveSwapA?.ownerId ??
    match.accommodationSwapA?.ownerId;
  const b =
    match.flightSwapB?.ownerId ??
    match.leaveSwapB?.ownerId ??
    match.accommodationSwapB?.ownerId;
  if (!a || !b) throw badRequest("Invalid match participants");
  return [a, b] as const;
};

export const requestService = {
  getMatch(matchId: string) {
    return prisma.match.findUniqueOrThrow({
      where: { id: matchId },
      include: { flightSwapA: true, flightSwapB: true, leaveSwapA: true, leaveSwapB: true, accommodationSwapA: true, accommodationSwapB: true },
    });
  },

  mine(userId: string) {
    return prisma.swapRequest.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: { match: true },
      orderBy: { createdAt: "desc" },
    });
  },

  incoming(userId: string) {
    return prisma.swapRequest.findMany({
      where: { receiverId: userId },
      include: { match: true, sender: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  outgoing(userId: string) {
    return prisma.swapRequest.findMany({
      where: { senderId: userId },
      include: { match: true, receiver: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(senderId: string, matchId: string) {
    const match = await requestService.getMatch(matchId);
    const [ownerA, ownerB] = getMatchOwners(match);
    if (![ownerA, ownerB].includes(senderId)) throw forbidden("Only matched crew can send a request");
    const receiverId = senderId === ownerA ? ownerB : ownerA;
    if (senderId === receiverId) throw badRequest("Sender and receiver must be different");

    const request = await prisma.swapRequest.create({ data: { matchId, senderId, receiverId, status: "PENDING" } });
    await auditService.log("SEND_REQUEST", "SwapRequest", { actorId: senderId, entityId: request.id });
    return request;
  },

  async reject(id: string, actorId: string) {
    const request = await prisma.swapRequest.findUniqueOrThrow({ where: { id } });
    if (request.receiverId !== actorId) throw forbidden("Only receiver can reject a request");
    ensurePendingRequest(request.status);
    const updated = await prisma.swapRequest.update({ where: { id }, data: { status: "REJECTED" } });
    return updated;
  },

  async cancel(id: string, actorId: string) {
    const request = await prisma.swapRequest.findUniqueOrThrow({ where: { id } });
    if (request.senderId !== actorId) throw forbidden("Only sender can cancel a request");
    ensurePendingRequest(request.status);
    return prisma.swapRequest.update({ where: { id }, data: { status: "CANCELLED" } });
  },

  async accept(id: string, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.swapRequest.findUniqueOrThrow({
        where: { id },
        include: { match: { include: { flightSwapA: true, flightSwapB: true, leaveSwapA: true, leaveSwapB: true, accommodationSwapA: true, accommodationSwapB: true } } },
      });
      if (request.receiverId !== actorId) throw forbidden("Only receiver can accept a request");
      ensurePendingRequest(request.status);

      const match = request.match;
      const flightIds = [match.flightSwapAId, match.flightSwapBId].filter(Boolean) as string[];
      const leaveIds = [match.leaveSwapAId, match.leaveSwapBId].filter(Boolean) as string[];
      const accommodationIds = [match.accommodationSwapAId, match.accommodationSwapBId].filter(Boolean) as string[];

      for (const swap of [match.flightSwapA, match.flightSwapB, match.leaveSwapA, match.leaveSwapB, match.accommodationSwapA, match.accommodationSwapB].filter(Boolean)) {
        ensureSwappableStatus(swap!.status);
      }

      const updated = await tx.swapRequest.update({ where: { id }, data: { status: "ACCEPTED" } });
      await tx.match.update({ where: { id: match.id }, data: { status: "ACCEPTED" } });
      if (flightIds.length) await tx.flightSwap.updateMany({ where: { id: { in: flightIds } }, data: { status: "ACCEPTED" } });
      if (leaveIds.length) await tx.leaveSwap.updateMany({ where: { id: { in: leaveIds } }, data: { status: "ACCEPTED" } });
      if (accommodationIds.length) await tx.accommodationSwap.updateMany({ where: { id: { in: accommodationIds } }, data: { status: "ACCEPTED" } });

      await tx.swapRequest.updateMany({
        where: {
          id: { not: id },
          status: "PENDING",
          OR: [
            { match: { flightSwapAId: { in: flightIds } } },
            { match: { flightSwapBId: { in: flightIds } } },
            { match: { leaveSwapAId: { in: leaveIds } } },
            { match: { leaveSwapBId: { in: leaveIds } } },
            { match: { accommodationSwapAId: { in: accommodationIds } } },
            { match: { accommodationSwapBId: { in: accommodationIds } } },
          ],
        },
        data: { status: "CANCELLED" },
      });

      await auditService.log("ACCEPT_REQUEST", "SwapRequest", { actorId, entityId: id, tx });
      return updated;
    });
  },
};
