import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/database";
import { badRequest } from "../../utils/errors";
import { auditService } from "../common/audit.service";
import { ensureOwnerOrAdmin } from "../common/swap-utils";
import { matchService } from "../matches/match.service";

type AccommodationSwapInput = {
  currentAccommodationId?: string;
  desiredAccommodationId?: string;
  currentAccommodationName?: string;
  desiredAccommodationName?: string;
  swapType: Prisma.AccommodationSwapUncheckedCreateInput["swapType"];
  gender?: Prisma.AccommodationSwapUncheckedCreateInput["gender"];
  note?: string;
};

const normalizeAccommodationName = (value: string) => value.trim().replace(/\s+/g, " ");

async function resolveAccommodationId(id?: string, name?: string) {
  if (id) return id;
  if (!name) throw badRequest("Accommodation is required");
  const normalized = normalizeAccommodationName(name);
  const accommodation = await prisma.accommodation.upsert({
    where: { name: normalized },
    create: { name: normalized, active: true },
    update: { active: true },
  });
  return accommodation.id;
}

export const accommodationSwapService = {
  listOpen: () => prisma.accommodationSwap.findMany({ where: { status: "OPEN" }, include: { owner: { include: { profile: true } }, currentAccommodation: true, desiredAccommodation: true } }),
  mine: (ownerId: string) => prisma.accommodationSwap.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" }, include: { currentAccommodation: true, desiredAccommodation: true } }),
  async create(ownerId: string, data: AccommodationSwapInput) {
    const currentAccommodationId = await resolveAccommodationId(data.currentAccommodationId, data.currentAccommodationName);
    const desiredAccommodationId = await resolveAccommodationId(data.desiredAccommodationId, data.desiredAccommodationName);
    if (currentAccommodationId === desiredAccommodationId) throw badRequest("Current and desired accommodations must be different");
    const swap = await prisma.accommodationSwap.create({
      data: {
        currentAccommodationId,
        desiredAccommodationId,
        swapType: data.swapType,
        gender: data.gender,
        note: data.note,
        ownerId,
        status: "DRAFT",
      } as never,
    });
    await auditService.log("CREATE_SWAP", "AccommodationSwap", { actorId: ownerId, entityId: swap.id });
    return swap;
  },
  get: (id: string) => prisma.accommodationSwap.findUniqueOrThrow({ where: { id }, include: { currentAccommodation: true, desiredAccommodation: true, owner: { include: { profile: true } } } }),
  async update(id: string, user: { id: string; role: Role }, data: Prisma.AccommodationSwapUpdateInput) {
    const swap = await prisma.accommodationSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    if (["CANCELLED", "COMPLETED", "ACCEPTED"].includes(swap.status)) throw badRequest("Finalized swap cannot be modified");
    return prisma.accommodationSwap.update({ where: { id }, data });
  },
  async publish(id: string, user: { id: string; role: Role }) {
    const swap = await prisma.accommodationSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    if (swap.status !== "DRAFT") throw badRequest("Only DRAFT swaps can be published");
    const updated = await prisma.accommodationSwap.update({ where: { id }, data: { status: "OPEN" } });
    await matchService.recompute("ACCOMMODATION");
    return updated;
  },
  async cancel(id: string, user: { id: string; role: Role }) {
    const swap = await prisma.accommodationSwap.findUniqueOrThrow({ where: { id } });
    ensureOwnerOrAdmin(swap.ownerId, user);
    const updated = await prisma.accommodationSwap.update({ where: { id }, data: { status: "CANCELLED" } });
    await auditService.log("CANCEL_SWAP", "AccommodationSwap", { actorId: user.id, entityId: id });
    return updated;
  },
};
