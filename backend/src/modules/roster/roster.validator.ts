import { z } from "zod";
import { idParamSchema } from "../common/validators";

export const rosterIdSchema = idParamSchema;
export const rosterQuerySchema = z.object({
  query: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export const createRosterItemSchema = z.object({
  body: z.object({
    flightId: z.string().optional(),
    dutyType: z.string().trim().min(2),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    note: z.string().optional(),
  }),
});
