import { z } from "zod";

export const imageSchema = z.object({
  path: z.string(),
  name: z.string(),
  size: z.number().int(),
  createdAt: z.number({ coerce: true }),
});

export type Image = z.infer<typeof imageSchema>;
