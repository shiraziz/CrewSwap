import { z } from "zod";
import { idParamSchema } from "../common/validators";

export const requestIdSchema = idParamSchema;
export const createRequestSchema = z.object({
  body: z.object({
    matchId: z.string().min(1),
  }),
});
