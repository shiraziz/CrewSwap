import type { NextFunction, Request, Response } from "express";
import { ok } from "../../utils/response";
import { adminService } from "./admin.service";

export const adminController = {
  overview: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await adminService.overview());
    } catch (error) {
      next(error);
    }
  },

  auditLogs: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await adminService.auditLogs());
    } catch (error) {
      next(error);
    }
  },

  cancelSwap: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await adminService.cancelAnySwap(req.user!.id, String(req.params.type), String(req.params.id)), "Swap cancelled");
    } catch (error) {
      next(error);
    }
  },
};
