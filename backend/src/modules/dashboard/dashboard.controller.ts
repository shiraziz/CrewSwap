import type { NextFunction, Request, Response } from "express";
import { ok } from "../../utils/response";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  home: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await dashboardService.home(req.user!.id));
    } catch (error) {
      next(error);
    }
  },
};
