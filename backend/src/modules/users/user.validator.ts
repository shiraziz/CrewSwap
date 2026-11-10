import { z } from "zod";
import { Role, UserStatus } from "@prisma/client";
import { idParamSchema } from "../common/validators";

export const listUsersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
    role: z.nativeEnum(Role).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const userIdSchema = idParamSchema;

export const updateUserStatusSchema = idParamSchema.extend({
  body: z.object({ status: z.nativeEnum(UserStatus) }),
});
