import type { NextFunction, Request, Response } from "express";
import { ok } from "../../utils/response";
import { matchService } from "./match.service";

export const matchController = {
  mine: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await matchService.mine(req.user!.id)); } catch (e) { next(e); } },
  get: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await matchService.get(String(req.params.id))); } catch (e) { next(e); } },
  recompute: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await matchService.recompute(req.body?.type), "Matches recomputed"); } catch (e) { next(e); } },
};
