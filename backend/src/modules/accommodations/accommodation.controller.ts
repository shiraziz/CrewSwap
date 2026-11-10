import type { NextFunction, Request, Response } from "express";
import { created, ok } from "../../utils/response";
import { accommodationService } from "./accommodation.service";

export const accommodationController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await accommodationService.list());
    } catch (error) {
      next(error);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(res, await accommodationService.create(req.body), "Accommodation created");
    } catch (error) {
      next(error);
    }
  },
};
