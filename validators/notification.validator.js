import { z } from "zod";

export const notificationIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid notification ID"),
});