import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createFlightSwapSchema, flightSwapIdSchema, updateFlightSwapSchema } from "./flight-swap.validator";
import { flightSwapController } from "./flight-swap.controller";

export const flightSwapRoutes = Router();

flightSwapRoutes.use(requireAuth);
flightSwapRoutes.post("/", validate(createFlightSwapSchema), flightSwapController.create);
flightSwapRoutes.post("/:id/publish", validate(flightSwapIdSchema), flightSwapController.publish);
