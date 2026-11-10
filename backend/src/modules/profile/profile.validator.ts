import { z } from "zod";
import { Rank } from "@prisma/client";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    photoUrl: z.string().url().optional().nullable(),
    rank: z.nativeEnum(Rank).optional().nullable(),
  }),
});

export const uploadProfilePhotoSchema = z.object({
  body: z.object({
    fileName: z.string().trim().min(1).max(160).optional(),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    data: z.string().min(1),
  }),
});
