import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { forbidden } from "../utils/errors";

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(forbidden("Insufficient permissions"));
    }
    return next();
  };
