import { z } from "zod";

export const mongoIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
});