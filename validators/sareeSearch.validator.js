import { z } from "zod";

export const searchSareeSchema = z.object({
  search: z.string().trim().optional(),

  category: z.string().trim().optional(),

  fabric: z.string().trim().optional(),

  color: z.string().trim().optional(),

  minPrice: z.coerce.number().min(0).optional(),

  maxPrice: z.coerce.number().min(0).optional(),

  available: z.enum(["true", "false"]).optional(),

  inStock: z.enum(["true", "false"]).optional(),

  admin: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  sort: z.enum([
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
    "name_asc",
    "name_desc",
  ]).optional(),

  page: z.coerce.number().int().positive().optional(),

  limit: z.coerce.number().int().positive().max(100).optional(),
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: "minPrice cannot be greater than maxPrice",
    path: ["minPrice"],
  }
);