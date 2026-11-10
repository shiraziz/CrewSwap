import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { accommodationController } from "./accommodation.controller";
import { createAccommodationSchema } from "./accommodation.validator";

export const accommodationRoutes = Router();

accommodationRoutes.use(requireAuth);
accommodationRoutes.get("/", accommodationController.list);
accommodationRoutes.post("/", requireRole("ADMIN"), validate(createAccommodationSchema), accommodationController.create);
