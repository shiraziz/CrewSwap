import type { NextFunction, Request, Response } from "express";
import { created, ok } from "../../utils/response";
import { flightService } from "./flight.service";

export const flightController = {
  my: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await flightService.myFlights(req.user!.id));
    } catch (error) {
      next(error);
    }
  },
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await flightService.getMine(String(req.params.id), req.user!.id, req.user!.role === "ADMIN"));
    } catch (error) {
      next(error);
    }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(res, await flightService.createMine(req.user!.id, req.body), "Flight created");
    } catch (error) {
      next(error);
    }
  },
};
