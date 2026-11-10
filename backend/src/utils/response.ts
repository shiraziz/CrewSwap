import type { Response } from "express";

export const ok = <T>(res: Response, data: T, message = "OK") => res.json({ success: true, message, data });

export const created = <T>(res: Response, data: T, message = "Created") =>
  res.status(201).json({ success: true, message, data });

export const noContent = (res: Response) => res.status(204).send();
