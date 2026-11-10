import type { NextFunction, Request, Response } from "express";
import { created, ok } from "../../utils/response";
import { accommodationSwapService } from "./accommodation-swap.service";

export const accommodationSwapController = {
  listOpen: async (_req: Request, res: Response, next: NextFunction) => { try { ok(res, await accommodationSwapService.listOpen()); } catch (e) { next(e); } },
  mine: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await accommodationSwapService.mine(req.user!.id)); } catch (e) { next(e); } },
  create: async (req: Request, res: Response, next: NextFunction) => { try { created(res, await accommodationSwapService.create(req.user!.id, req.body), "Accommodation swap created"); } catch (e) { next(e); } },
  get: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await accommodationSwapService.get(String(req.params.id))); } catch (e) { next(e); } },
  update: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await accommodationSwapService.update(String(req.params.id), req.user!, req.body), "Accommodation swap updated"); } catch (e) { next(e); } },
  publish: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await accommodationSwapService.publish(String(req.params.id), req.user!), "Accommodation swap published"); } catch (e) { next(e); } },
  cancel: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await accommodationSwapService.cancel(String(req.params.id), req.user!), "Accommodation swap cancelled"); } catch (e) { next(e); } },
};
