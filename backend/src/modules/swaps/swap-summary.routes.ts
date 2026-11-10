import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { swapSummaryController } from "./swap-summary.controller";

export const swapSummaryRoutes = Router();

swapSummaryRoutes.use(requireAuth);
swapSummaryRoutes.get("/active", swapSummaryController.active);
swapSummaryRoutes.get("/history", swapSummaryController.history);
