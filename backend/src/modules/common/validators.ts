import { z } from "zod";

export const idParamSchema = z.object({ params: z.object({ id: z.string().min(1) }) });

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export const dateString = z.coerce.date();

export const optionalText = z.string().trim().min(1).max(1000).optional();
