import { z } from "zod";
import { idParamSchema } from "../common/validators";

export const leaveSwapIdSchema = idParamSchema;
export const createLeaveSwapSchema = z.object({
  body: z.object({
    currentStart: z.coerce.date(),
    currentEnd: z.coerce.date(),
    desiredStart: z.coerce.date(),
    desiredEnd: z.coerce.date(),
    note: z.string().max(1000).optional(),
  }),
});
export const updateLeaveSwapSchema = idParamSchema.extend({ body: createLeaveSwapSchema.shape.body.partial() });
