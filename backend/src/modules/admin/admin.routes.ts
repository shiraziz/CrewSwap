import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { adminController } from "./admin.controller";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole("ADMIN"));
adminRoutes.get("/overview", adminController.overview);
adminRoutes.get("/audit-logs", adminController.auditLogs);
adminRoutes.post(
  "/swaps/:type/:id/cancel",
  validate(z.object({ params: z.object({ type: z.enum(["flight", "leave", "accommodation"]), id: z.string() }) })),
  adminController.cancelSwap,
);
