import type { NextFunction, Request, Response } from "express";
import { ok } from "../../utils/response";
import { profileService } from "./profile.service";

export const profileController = {
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await profileService.getMe(req.user!.id));
    } catch (error) {
      next(error);
    }
  },

  updateMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await profileService.updateMe(req.user!.id, req.body), "Profile updated");
    } catch (error) {
      next(error);
    }
  },

  uploadPhoto: async (req: Request, res: Response, next: NextFunction) => {
    try {
      ok(res, await profileService.uploadPhoto(req.user!.id, req.body), "Profile photo updated");
    } catch (error) {
      next(error);
    }
  },
};
