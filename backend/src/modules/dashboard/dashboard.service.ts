import { prisma } from "../../config/database";

export const dashboardService = {
  async home(userId: string) {
    const [
      activeFlightSwaps,
      activeLeaveSwaps,
      activeAccommodationSwaps,
      newMatches,
    ] = await Promise.all([
      prisma.flightSwap.count({ where: { ownerId: userId, status: { in: ["OPEN", "PENDING", "ACCEPTED"] } } }),
      prisma.leaveSwap.count({ where: { ownerId: userId, status: { in: ["OPEN", "PENDING", "ACCEPTED"] } } }),
      prisma.accommodationSwap.count({ where: { ownerId: userId, status: { in: ["OPEN", "PENDING", "ACCEPTED"] } } }),
      prisma.match.count({
        where: {
          status: "NEW",
          OR: [
            { flightSwapA: { ownerId: userId } }, { flightSwapB: { ownerId: userId } },
            { leaveSwapA: { ownerId: userId } }, { leaveSwapB: { ownerId: userId } },
            { accommodationSwapA: { ownerId: userId } }, { accommodationSwapB: { ownerId: userId } },
          ],
        },
      }),
    ]);

    return {
      activeSwaps: activeFlightSwaps + activeLeaveSwaps + activeAccommodationSwaps,
      flightSwaps: activeFlightSwaps,
      leaveSwaps: activeLeaveSwaps,
      accommodationSwaps: activeAccommodationSwaps,
      newMatches,
    };
  },
};
