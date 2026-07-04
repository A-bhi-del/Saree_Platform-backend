import { z } from "zod";

const saleSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3)
        .max(100),

    description: z
        .string()
        .trim()
        .max(500)
        .optional(),

    discountType: z.enum([
        "percentage",
        "fixed",
    ]),

    discountValue: z
        .number()
        .positive(),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),
});


export const createSaleSchema = saleSchema.refine(
    (data) =>
        data.endDate > data.startDate,
    {
        message:
            "End date must be after start date",
        path: ["endDate"],
    }
).refine(
    (data) =>
        data.discountType !==
        "percentage" ||
        data.discountValue <= 100,
    {
        message:
            "Percentage discount cannot exceed 100",
        path: ["discountValue"],
    }
);

export const updateSaleSchema = saleSchema.partial();