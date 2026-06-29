import { z } from "zod";

export const createSareeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Saree name must be at least 3 characters")
    .max(100, "Saree name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description is too long")
    .optional(),

  fabric: z
    .string()
    .trim()
    .min(2, "Fabric is required"),

  color: z
    .string()
    .trim()
    .min(2, "Color is required"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required"),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),

  discountPercentage: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  images: z
    .array(z.string().url("Invalid image URL"))
    .optional(),
});

export const updateSareeSchema = createSareeSchema.partial();