import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createRosterItemSchema, rosterIdSchema, rosterQuerySchema } from "./roster.validator";
import { rosterController } from "./roster.controller";

export const rosterRoutes = Router();

rosterRoutes.use(requireAuth);
rosterRoutes.get("/", validate(rosterQuerySchema), rosterController.list);
