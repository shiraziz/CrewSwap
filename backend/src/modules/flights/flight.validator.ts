import { z } from "zod";
import { Fleet } from "@prisma/client";
import { idParamSchema } from "../common/validators";

export const flightIdSchema = idParamSchema;

export const createFlightSchema = z.object({
  body: z.object({
    flightNumber: z.string().trim().min(2),
    date: z.coerce.date(),
    origin: z.string().trim().min(3).max(4),
    destination: z.string().trim().min(3).max(4),
    departureTime: z.coerce.date(),
    arrivalTime: z.coerce.date(),
    fleet: z.nativeEnum(Fleet),
  }),
});
