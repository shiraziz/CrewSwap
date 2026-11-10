import type { NextFunction, Request, Response } from "express";
import { created, ok } from "../../utils/response";
import { flightSwapService } from "./flight-swap.service";

export const flightSwapController = {
  listOpen: async (_req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await flightSwapService.listOpen()); } catch (error) { next(error); }
  },
  mine: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await flightSwapService.mine(req.user!.id)); } catch (error) { next(error); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try { created(res, await flightSwapService.create(req.user!.id, req.body), "Flight swap created"); } catch (error) { next(error); }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await flightSwapService.get(String(req.params.id))); } catch (error) { next(error); }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await flightSwapService.update(String(req.params.id), req.user!, req.body), "Flight swap updated"); } catch (error) { next(error); }
  },
  publish: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await flightSwapService.publish(String(req.params.id), req.user!), "Flight swap published"); } catch (error) { next(error); }
  },
  cancel: async (req: Request, res: Response, next: NextFunction) => {
    try { ok(res, await flightSwapService.cancel(String(req.params.id), req.user!), "Flight swap cancelled"); } catch (error) { next(error); }
  },
};
