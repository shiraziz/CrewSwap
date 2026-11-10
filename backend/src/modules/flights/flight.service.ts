import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export const flightService = {
  myFlights: (ownerId: string) => prisma.flight.findMany({ where: { ownerId }, orderBy: { departureTime: "asc" } }),
  getMine: (id: string, ownerId: string, isAdmin = false) =>
    prisma.flight.findFirstOrThrow({ where: { id, ...(isAdmin ? {} : { ownerId }) } }),
  createMine: (ownerId: string, data: Omit<Prisma.FlightUncheckedCreateInput, "id" | "ownerId" | "createdAt" | "updatedAt">) =>
    prisma.flight.create({ data: { ...data, ownerId } }),
};
