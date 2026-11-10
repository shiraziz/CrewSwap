import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { userController } from "./user.controller";
import { listUsersSchema, updateUserStatusSchema, userIdSchema } from "./user.validator";

export const userRoutes = Router();

userRoutes.use(requireAuth, requireRole("ADMIN"));
userRoutes.get("/", validate(listUsersSchema), userController.list);
userRoutes.get("/:id", validate(userIdSchema), userController.get);
userRoutes.patch("/:id/status", validate(updateUserStatusSchema), userController.updateStatus);
