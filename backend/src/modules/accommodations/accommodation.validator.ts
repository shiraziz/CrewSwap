import { z } from "zod";
import { idParamSchema } from "../common/validators";

export const accommodationIdSchema = idParamSchema;
export const createAccommodationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    location: z.string().trim().optional(),
    active: z.boolean().optional(),
  }),
});
