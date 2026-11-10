import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { matchController } from "./match.controller";
import { matchIdSchema, recomputeSchema } from "./match.validator";

export const matchRoutes = Router();

matchRoutes.use(requireAuth);
matchRoutes.get("/", matchController.mine);
matchRoutes.post("/recompute", validate(recomputeSchema), matchController.recompute);
matchRoutes.get("/:id", validate(matchIdSchema), matchController.get);
