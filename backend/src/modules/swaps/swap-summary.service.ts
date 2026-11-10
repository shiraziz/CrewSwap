import { prisma } from "../../config/database";

const activeStatuses = ["OPEN", "PENDING", "ACCEPTED"] as const;
const historyStatuses = ["ACCEPTED", "COMPLETED", "CANCELLED"] as const;

const withType = <T extends object>(type: "FLIGHT" | "LEAVE" | "ACCOMMODATION", items: T[]) =>
  items.map((item) => ({ ...item, type }));

export const swapSummaryService = {
  async active(userId: string) {
    const [flightSwaps, leaveSwaps, accommodationSwaps] = await Promise.all([
      prisma.flightSwap.findMany({ where: { ownerId: userId, status: { in: [...activeStatuses] } }, include: { flight: true }, orderBy: { createdAt: "desc" } }),
      prisma.leaveSwap.findMany({ where: { ownerId: userId, status: { in: [...activeStatuses] } }, orderBy: { createdAt: "desc" } }),
      prisma.accommodationSwap.findMany({
        where: { ownerId: userId, status: { in: [...activeStatuses] } },
        include: { currentAccommodation: true, desiredAccommodation: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return [
      ...withType("FLIGHT", flightSwaps),
      ...withType("LEAVE", leaveSwaps),
      ...withType("ACCOMMODATION", accommodationSwaps),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async history(userId: string) {
    const [flightSwaps, leaveSwaps, accommodationSwaps] = await Promise.all([
      prisma.flightSwap.findMany({ where: { ownerId: userId, status: { in: [...historyStatuses] } }, include: { flight: true }, orderBy: { updatedAt: "desc" } }),
      prisma.leaveSwap.findMany({ where: { ownerId: userId, status: { in: [...historyStatuses] } }, orderBy: { updatedAt: "desc" } }),
      prisma.accommodationSwap.findMany({
        where: { ownerId: userId, status: { in: [...historyStatuses] } },
        include: { currentAccommodation: true, desiredAccommodation: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);
    return [
      ...withType("FLIGHT", flightSwaps),
      ...withType("LEAVE", leaveSwaps),
      ...withType("ACCOMMODATION", accommodationSwaps),
    ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },
};
