import express from "express";
import validate from "../middleware/validate.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../validators/auth.validator.js";
import { getCurrentUser,  login,  logout, register, updateProfile } from "../controllers/auth.controller.js";
import { sendOtp } from "../controllers/auth.controller.js";
import { sendOtpSchema } from "../validators/auth.validator.js";
import { verifyOtp } from "../controllers/auth.controller.js";
import { verifyOtpSchema } from "../validators/auth.validator.js";
import protect from "../middleware/auth.middleware.js";
import rateLimiter from "../middleware/rateLimit.middleware.js";
import { DEFAULT_RATE } from "../config/rates.js";

const router = express.Router();

router.post(
  "/send-otp",
  rateLimiter(DEFAULT_RATE),
  validate(sendOtpSchema),
  sendOtp
);

router.post(
  "/verify-otp",
  rateLimiter(DEFAULT_RATE),
  validate(verifyOtpSchema),
  verifyOtp
);

router.post(
  "/register",
  rateLimiter(DEFAULT_RATE),
  validate(registerSchema),
  register
);

router.post(
  "/login",
  rateLimiter(DEFAULT_RATE),
  validate(loginSchema),
  login
);

router.get("/me", protect, getCurrentUser);

router.patch(
  "/edit-profile",
  protect,
  validate(updateProfileSchema),
  updateProfile
);

router.post("/logout", protect, logout);

export default router;