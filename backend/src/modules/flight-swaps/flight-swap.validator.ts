import { z } from "zod";
import { Fleet, Rank, ReturnPreference } from "@prisma/client";
import { idParamSchema } from "../common/validators";

export const flightSwapIdSchema = idParamSchema;

export const createFlightSwapSchema = z.object({
  body: z.object({
    flightId: z.string().min(1),
    flightDate: z.coerce.date(),
    origin: z.string().trim().min(3).max(4),
    destination: z.string().trim().min(3).max(4),
    departureTime: z.coerce.date(),
    arrivalTime: z.coerce.date(),
    flightNumber: z.string().trim().min(2),
    fleetType: z.nativeEnum(Fleet),
    crewRank: z.nativeEnum(Rank),
    tripDuration: z.coerce.number().int().positive(),
    returnPreference: z.nativeEnum(ReturnPreference).optional(),
    specificDestinations: z.array(z.string().trim().min(3).max(4)).optional(),
    specificDaysOff: z.array(z.coerce.date()).optional(),
    note: z.string().max(1000).optional(),
  }),
});

export const updateFlightSwapSchema = idParamSchema.extend({
  body: createFlightSwapSchema.shape.body.partial(),
});
