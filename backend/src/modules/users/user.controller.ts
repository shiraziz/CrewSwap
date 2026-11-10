import type { NextFunction, Request, Response } from "express";
import { ok } from "../../utils/response";
import { userService } from "./user.service";

export const userController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.validated?.query ?? req.query) as Record<string, unknown>;
      ok(res, await userService.list(query));
    } catch (error) {
      next(error);
    }
  },

  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await userService.getById(String(req.params.id)));
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await userService.updateStatus(String(req.params.id), req.body.status), "User status updated");
    } catch (error) {
      next(error);
    }
  },
};
