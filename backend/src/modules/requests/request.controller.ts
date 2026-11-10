import type { NextFunction, Request, Response } from "express";
import { created, ok } from "../../utils/response";
import { requestService } from "./request.service";

export const requestController = {
  mine: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await requestService.mine(req.user!.id)); } catch (e) { next(e); } },
  incoming: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await requestService.incoming(req.user!.id)); } catch (e) { next(e); } },
  outgoing: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await requestService.outgoing(req.user!.id)); } catch (e) { next(e); } },
  create: async (req: Request, res: Response, next: NextFunction) => { try { created(res, await requestService.create(req.user!.id, req.body.matchId), "Request sent"); } catch (e) { next(e); } },
  accept: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await requestService.accept(String(req.params.id), req.user!.id), "Request accepted"); } catch (e) { next(e); } },
  reject: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await requestService.reject(String(req.params.id), req.user!.id), "Request rejected"); } catch (e) { next(e); } },
  cancel: async (req: Request, res: Response, next: NextFunction) => { try { ok(res, await requestService.cancel(String(req.params.id), req.user!.id), "Request cancelled"); } catch (e) { next(e); } },
};
