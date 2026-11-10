import { z } from "zod";
import { Rank } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    rank: z.nativeEnum(Rank).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});
