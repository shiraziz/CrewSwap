import { z } from "zod";
import { idParamSchema } from "../common/validators";

export const matchIdSchema = idParamSchema;
export const recomputeSchema = z.object({
  body: z.object({ type: z.enum(["FLIGHT", "LEAVE", "ACCOMMODATION"]).optional() }).optional(),
});
