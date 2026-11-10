import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { qualificationController } from "./qualification.controller";
import { updateQualificationsSchema } from "./qualification.validator";

export const qualificationRoutes = Router();

qualificationRoutes.use(requireAuth);
qualificationRoutes.get("/me", qualificationController.mine);
qualificationRoutes.put("/me", validate(updateQualificationsSchema), qualificationController.replaceMine);
