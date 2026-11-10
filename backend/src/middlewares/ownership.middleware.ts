import type { NextFunction, Request, Response } from "express";
import { forbidden } from "../utils/errors";

export const requireSelfOrAdmin =
  (paramName = "id") =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role === "ADMIN" || req.user?.id === req.params[paramName]) {
      return next();
    }
    return next(forbidden("You can only access your own resource"));
  };
