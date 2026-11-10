import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createRequestSchema, requestIdSchema } from "./request.validator";
import { requestController } from "./request.controller";

export const requestRoutes = Router();

requestRoutes.use(requireAuth);
requestRoutes.get("/incoming", requestController.incoming);
requestRoutes.post("/", validate(createRequestSchema), requestController.create);
requestRoutes.post("/:id/accept", validate(requestIdSchema), requestController.accept);
requestRoutes.post("/:id/reject", validate(requestIdSchema), requestController.reject);
requestRoutes.post("/:id/cancel", validate(requestIdSchema), requestController.cancel);
