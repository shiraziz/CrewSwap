import type { Request, Response } from "express";
import { Fleet, Rank } from "@prisma/client";
import { ok } from "../../utils/response";

const postableRanks = Object.values(Rank).filter(
  (rank) => rank !== "PURSER" && rank !== "IN_FLIGHT_SUPERVISOR",
);

export const referenceController = {
  fleets: (_req: Request, res: Response) => {
    ok(res, Object.values(Fleet));
  },
  ranks: (_req: Request, res: Response) => {
    ok(res, postableRanks);
  },
};
