import { prisma } from "../../config/database";
import { auditService } from "../common/audit.service";

export const adminService = {
  async overview() {
    const [users, openFlightSwaps, openLeaveSwaps, openAccommodationSwaps, pendingRequests, matches] =
      await Promise.all([
        prisma.user.count(),
        prisma.flightSwap.count({ where: { status: "OPEN" } }),
        prisma.leaveSwap.count({ where: { status: "OPEN" } }),
        prisma.accommodationSwap.count({ where: { status: "OPEN" } }),
        prisma.swapRequest.count({ where: { status: "PENDING" } }),
        prisma.match.count({ where: { status: "NEW" } }),
      ]);
    return { users, openFlightSwaps, openLeaveSwaps, openAccommodationSwaps, pendingRequests, matches };
  },

  async auditLogs() {
    return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  },

  async cancelAnySwap(actorId: string, type: string, id: string) {
    const delegate = type === "flight" ? prisma.flightSwap : type === "leave" ? prisma.leaveSwap : prisma.accommodationSwap;
    const swap = await (delegate as never as { update: Function }).update({ where: { id }, data: { status: "CANCELLED" } });
    await auditService.log("ADMIN_CANCEL_SWAP", `${type}Swap`, { actorId, entityId: id });
    return swap;
  },
};
