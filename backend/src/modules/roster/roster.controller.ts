import type { NextFunction, Request, Response } from "express";
import { created, ok } from "../../utils/response";
import { rosterService } from "./roster.service";

export const rosterController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.validated?.query ?? req.query) as { from?: Date; to?: Date };
      ok(res, await rosterService.list(req.user!.id, query));
    } catch (error) {
      next(error);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await rosterService.get(req.user!.id, String(req.params.id)));
    } catch (error) {
      next(error);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(res, await rosterService.create(req.user!.id, req.body), "Roster item created");
    } catch (error) {
      next(error);
    }
  },
  sync: async (req: Request, res: Response) => ok(res, rosterService.sync(req.user!.id)),
};
