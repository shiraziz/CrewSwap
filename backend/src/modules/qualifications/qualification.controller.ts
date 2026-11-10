import type { NextFunction, Request, Response } from "express";
import { ok } from "../../utils/response";
import { qualificationService } from "./qualification.service";

export const qualificationController = {
  mine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await qualificationService.listMine(req.user!.id));
    } catch (error) {
      next(error);
    }
  },

  replaceMine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await qualificationService.replaceMine(req.user!.id, req.body.fleets), "Qualifications updated");
    } catch (error) {
      next(error);
    }
  },
};
