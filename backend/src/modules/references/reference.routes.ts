import { Router } from "express";
import { referenceController } from "./reference.controller";

export const referenceRoutes = Router();

referenceRoutes.get("/fleets", referenceController.fleets);
referenceRoutes.get("/ranks", referenceController.ranks);
