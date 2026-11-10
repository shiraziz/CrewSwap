import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { accommodationSwapController } from "./accommodation-swap.controller";
import { accommodationSwapIdSchema, createAccommodationSwapSchema, updateAccommodationSwapSchema } from "./accommodation-swap.validator";

export const accommodationSwapRoutes = Router();

accommodationSwapRoutes.use(requireAuth);
accommodationSwapRoutes.post("/", validate(createAccommodationSwapSchema), accommodationSwapController.create);
accommodationSwapRoutes.post("/:id/publish", validate(accommodationSwapIdSchema), accommodationSwapController.publish);
