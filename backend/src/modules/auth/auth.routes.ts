import { Router } from "express";
import { authController } from "./auth.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { loginRateLimiter } from "../../middlewares/rate-limit.middleware";
import { changePasswordSchema, loginSchema, refreshSchema, registerSchema } from "./auth.validator";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), authController.register);
authRoutes.post("/login", loginRateLimiter, validate(loginSchema), authController.login);
authRoutes.post("/refresh", validate(refreshSchema), authController.refresh);
authRoutes.post("/change-password", requireAuth, validate(changePasswordSchema), authController.changePassword);
authRoutes.post("/logout", requireAuth, authController.logout);
authRoutes.get("/me", requireAuth, authController.me);
