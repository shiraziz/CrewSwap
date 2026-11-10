import { z } from "zod";
import { idParamSchema } from "../common/validators";

export const adminIdSchema = idParamSchema;
export const adminCancelSwapSchema = idParamSchema.extend({
  body: z.object({ reason: z.string().max(500).optional() }),
});
