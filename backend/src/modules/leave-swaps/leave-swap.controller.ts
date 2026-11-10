import type { NextFunction, Request, Response } from "express";
import { created, ok } from "../../utils/response";
import { leaveSwapService } from "./leave-swap.service";

export const leaveSwapController = {
  listOpen: async (_req: Request, res: Response, next: NextFunction) => { try { ok(res, await leaveSwapService.listOpen()); } catch (e) { next(e); } },
  mine: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await leaveSwapService.mine(req.user!.id)); } catch (e) { next(e); } },
  create: async (req: Request, res: Response, next: NextFunction) => { try { created(res, await leaveSwapService.create(req.user!.id, req.body), "Leave swap created"); } catch (e) { next(e); } },
  get: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await leaveSwapService.get(String(req.params.id))); } catch (e) { next(e); } },
  update: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await leaveSwapService.update(String(req.params.id), req.user!, req.body), "Leave swap updated"); } catch (e) { next(e); } },
  publish: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await leaveSwapService.publish(String(req.params.id), req.user!), "Leave swap published"); } catch (e) { next(e); } },
  cancel: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await leaveSwapService.cancel(String(req.params.id), req.user!), "Leave swap cancelled"); } catch (e) { next(e); } },
};
