import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { unauthorized, forbidden } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
      throw unauthorized("Missing bearer token");
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw unauthorized("Invalid session");
    }
    if (user.status !== "ACTIVE") {
      throw forbidden("Account is not active");
    }

    req.user = { id: user.id, email: user.email, role: user.role, status: user.status };
    next();
  } catch (error) {
    next(error);
  }
};
