import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { profileController } from "./profile.controller";
import { updateProfileSchema, uploadProfilePhotoSchema } from "./profile.validator";

export const profileRoutes = Router();

profileRoutes.use(requireAuth);
profileRoutes.get("/me", profileController.me);
profileRoutes.patch("/me", validate(updateProfileSchema), profileController.updateMe);
profileRoutes.post("/photo", validate(uploadProfilePhotoSchema), profileController.uploadPhoto);
