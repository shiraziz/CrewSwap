import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";

export const errorMiddleware = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message, details: error.details });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return res.status(409).json({ success: false, message: "Unique constraint violation" });
  }

  logger.error(error);
  return res.status(500).json({ success: false, message: "Internal server error" });
};
