import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(50, "Coupon code must not exceed 50 characters")
    .regex(/^[A-Z0-9-_]+$/i, "Coupon code can only contain letters, numbers, hyphens, and underscores"),
  
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  
  discountType: z.enum(["PERCENTAGE", "FIXED"], {
    errorMap: () => ({ message: "Discount type must be either PERCENTAGE or FIXED" })
  }),
  
  discountValue: z.number()
    .positive("Discount value must be positive")
    .refine((val) => val > 0, "Discount value must be greater than 0"),
  
  maxDiscountAmount: z.number()
    .positive("Max discount amount must be positive")
    .optional()
    .nullable(),
  
  minOrderAmount: z.number()
    .min(0, "Minimum order amount cannot be negative")
    .default(0),
  
  startsAt: z.string()
    .or(z.date())
    .transform((val) => new Date(val)),
  
  expiresAt: z.string()
    .or(z.date())
    .transform((val) => new Date(val)),
  
  usageLimit: z.number()
    .int("Usage limit must be an integer")
    .positive("Usage limit must be positive")
    .optional()
    .nullable(),
  
  perUserLimit: z.number()
    .int("Per user limit must be an integer")
    .positive("Per user limit must be positive")
    .default(1),
  
  applicableSarees: z.array(z.string()).optional().default([]),
  
  applicableCategories: z.array(z.string()).optional().default([]),
  
  firstOrderOnly: z.boolean().default(false),
  
  allowSaleItems: z.boolean().default(true),
  
  isActive: z.boolean().default(true)
}).refine((data) => {
  if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"]
}).refine((data) => {
  if (data.expiresAt <= data.startsAt) {
    return false;
  }
  return true;
}, {
  message: "Expiration date must be after start date",
  path: ["expiresAt"]
}).refine((data) => {
  if (data.discountType === "FIXED" && data.maxDiscountAmount) {
    return false;
  }
  return true;
}, {
  message: "Max discount amount is only applicable for percentage discounts",
  path: ["maxDiscountAmount"]
});

export const updateCouponSchema = z.object({
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  
  discountValue: z.number()
    .positive("Discount value must be positive")
    .optional(),
  
  maxDiscountAmount: z.number()
    .positive("Max discount amount must be positive")
    .optional()
    .nullable(),
  
  minOrderAmount: z.number()
    .min(0, "Minimum order amount cannot be negative")
    .optional(),
  
  startsAt: z.string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  
  expiresAt: z.string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional(),
  
  usageLimit: z.number()
    .int("Usage limit must be an integer")
    .positive("Usage limit must be positive")
    .optional()
    .nullable(),
  
  perUserLimit: z.number()
    .int("Per user limit must be an integer")
    .positive("Per user limit must be positive")
    .optional(),
  
  applicableSarees: z.array(z.string()).optional(),
  
  applicableCategories: z.array(z.string()).optional(),
  
  firstOrderOnly: z.boolean().optional(),
  
  allowSaleItems: z.boolean().optional(),
  
  isActive: z.boolean().optional()
}).refine((data) => {
  if (data.discountType === "PERCENTAGE" && data.discountValue && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"]
});

export const applyCouponSchema = z.object({
  code: z.string()
    .min(1, "Coupon code is required")
    .transform((val) => val.trim().toUpperCase())
});

export const removeCouponSchema = z.object({
  code: z.string()
    .min(1, "Coupon code is required")
    .transform((val) => val.trim().toUpperCase())
});

export const toggleCouponStatusSchema = z.object({
  isActive: z.boolean()
});

export const getCouponsQuerySchema = z.object({
  page: z.string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1)),
  
  limit: z.string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100).default(10)),
  
  isActive: z.enum(["true", "false", "all"])
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  
  discountType: z.enum(["PERCENTAGE", "FIXED", "all"])
    .optional()
    .transform((val) => val === "all" ? undefined : val),
  
  search: z.string().optional()
});
