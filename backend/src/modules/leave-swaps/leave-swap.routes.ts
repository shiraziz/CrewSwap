import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createLeaveSwapSchema, leaveSwapIdSchema, updateLeaveSwapSchema } from "./leave-swap.validator";
import { leaveSwapController } from "./leave-swap.controller";

export const leaveSwapRoutes = Router();

leaveSwapRoutes.use(requireAuth);
leaveSwapRoutes.post("/", validate(createLeaveSwapSchema), leaveSwapController.create);
leaveSwapRoutes.post("/:id/publish", validate(leaveSwapIdSchema), leaveSwapController.publish);
