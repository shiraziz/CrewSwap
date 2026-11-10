import type { Role, SwapStatus } from "@prisma/client";
import { forbidden, badRequest } from "../../utils/errors";

export const ensureOwnerOrAdmin = (ownerId: string, user: { id: string; role: Role }) => {
  if (ownerId !== user.id && user.role !== "ADMIN") {
    throw forbidden("Only the owner or an admin can perform this action");
  }
};

export const ensurePendingRequest = (status: string) => {
  if (status !== "PENDING") {
    throw badRequest("Only PENDING requests can be changed");
  }
};

export const ensureSwappableStatus = (status: SwapStatus) => {
  if (!["OPEN", "PENDING"].includes(status)) {
    throw badRequest("Swap is not available");
  }
};

export const orderPair = (a: string, b: string) => (a < b ? [a, b] : [b, a]);
