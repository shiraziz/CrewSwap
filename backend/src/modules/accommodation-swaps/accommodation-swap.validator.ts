import { z } from "zod";
import { GenderPreference, SwapType } from "@prisma/client";
import { idParamSchema } from "../common/validators";

export const accommodationSwapIdSchema = idParamSchema;
const accommodationSwapBodySchema = z.object({
  currentAccommodationId: z.string().min(1).optional(),
  desiredAccommodationId: z.string().min(1).optional(),
  currentAccommodationName: z.string().trim().min(2).optional(),
  desiredAccommodationName: z.string().trim().min(2).optional(),
  swapType: z.nativeEnum(SwapType),
  gender: z.nativeEnum(GenderPreference).optional(),
  note: z.string().max(1000).optional(),
});

export const createAccommodationSwapSchema = z.object({
  body: accommodationSwapBodySchema
    .refine((body) => body.currentAccommodationId || body.currentAccommodationName, { message: "Current accommodation is required" })
    .refine((body) => body.desiredAccommodationId || body.desiredAccommodationName, { message: "Desired accommodation is required" }),
});
export const updateAccommodationSwapSchema = idParamSchema.extend({ body: accommodationSwapBodySchema.partial() });
