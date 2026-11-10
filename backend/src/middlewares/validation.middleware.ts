import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import type { ValidatedRequestData } from "../types";

export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(result.error);
    }

    const data = result.data as ValidatedRequestData;
    req.validated = data;
    req.body = data.body ?? req.body;
    req.params = (data.params ?? req.params) as typeof req.params;
    return next();
  };
