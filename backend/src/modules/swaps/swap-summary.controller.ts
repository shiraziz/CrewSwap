import type { NextFunction, Request, Response } from "express";
import { ok } from "../../utils/response";
import { swapSummaryService } from "./swap-summary.service";

export const swapSummaryController = {
  active: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await swapSummaryService.active(req.user!.id));
    } catch (error) {
      next(error);
    }
  },

  history: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await swapSummaryService.history(req.user!.id));
    } catch (error) {
      next(error);
    }
  },
};
