import { z } from "zod";

export const createRequestSchema = z.object({
  admin: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Admin ID"),

saree: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Saree ID"),

  requestType: z
    .string()
    .trim()
    .min(2, "Request type is required"),

  designName: z
    .string()
    .trim()
    .min(3, "Design name is required")
    .max(100),

  fabric: z
    .string()
    .trim()
    .min(2, "Fabric is required"),

  color: z
    .string()
    .trim()
    .min(2, "Color is required"),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  quantity: z
    .number()
    .int()
    .positive("Quantity must be greater than 0"),

  budget: z
    .number()
    .positive("Budget must be greater than 0"),

  image: z.string().optional(),

  requiredByDate: z.string().optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});