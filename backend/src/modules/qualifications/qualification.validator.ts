import { z } from "zod";
import { Fleet } from "@prisma/client";

export const updateQualificationsSchema = z.object({
  body: z.object({
    fleets: z.array(z.nativeEnum(Fleet)).min(0),
  }),
});
