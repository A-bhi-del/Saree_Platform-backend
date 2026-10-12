import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),

  title: z
    .string()
    .trim()
    .max(100, "Title cannot exceed 100 characters")
    .optional()
    .default(""),

  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(2000, "Comment cannot exceed 2000 characters")
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .optional(),

  title: z
    .string()
    .trim()
    .max(100, "Title cannot exceed 100 characters")
    .optional(),

  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(2000, "Comment cannot exceed 2000 characters")
    .optional()
}).refine(
  (data) => data.rating !== undefined || data.title !== undefined || data.comment !== undefined,
  {
    message: "At least one field (rating, title, or comment) must be provided"
  }
);

export const listReviewsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1).default(1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(50).default(10)),

  sort: z
    .enum(["newest", "oldest", "highest", "lowest", "helpful"])
    .optional()
    .default("newest"),

  rating: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().min(1).max(5).optional()),

  verifiedPurchase: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    })
    .pipe(z.boolean().optional()),

  withImages: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    })
    .pipe(z.boolean().optional())
});

export const moderateReviewSchema = z.object({
  moderationStatus: z.enum(["VISIBLE", "HIDDEN", "REMOVED"]),

  moderationReason: z
    .string()
    .trim()
    .max(500, "Moderation reason cannot exceed 500 characters")
    .optional()
});
