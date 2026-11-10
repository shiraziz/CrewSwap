import type { Request, Response, NextFunction } from "express";
import { created, ok } from "../../utils/response";
import { authService } from "./auth.service";

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      created(res, await authService.register(req.body), "Registration successful");
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await authService.login(req.body.email, req.body.password), "Login successful");
    } catch (error) {
      next(error);
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await authService.me(req.user!.id));
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await authService.refresh(req.body.refreshToken), "Token refreshed");
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword), "Password updated");
    } catch (error) {
      next(error);
    }
  },

  logout: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, { loggedOut: true }, "Logged out");
    } catch (error) {
      next(error);
    }
  },
};
