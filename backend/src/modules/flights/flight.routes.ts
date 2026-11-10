import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createFlightSchema, flightIdSchema } from "./flight.validator";
import { flightController } from "./flight.controller";

export const flightRoutes = Router();

flightRoutes.use(requireAuth);
flightRoutes.get("/my", flightController.my);
flightRoutes.post("/", validate(createFlightSchema), flightController.create);
