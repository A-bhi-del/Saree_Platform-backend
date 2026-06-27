import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .toLowerCase(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),

    role: z
        .enum(["customer", "admin"])
        .optional(),
});

export const sendOtpSchema = z.object({
  email: z.string().trim().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email(),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});