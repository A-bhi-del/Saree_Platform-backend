import express from "express";
import validate from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { getCurrentUser, login, logout, register } from "../controllers/auth.controller.js";
import { sendOtp } from "../controllers/auth.controller.js";
import { sendOtpSchema } from "../validators/auth.validator.js";
import { verifyOtp } from "../controllers/auth.controller.js";
import { verifyOtpSchema } from "../validators/auth.validator.js";
import protect from "../middleware/auth.middleware.js";
import {
  loginLimiter,
  otpLimiter,
  registerLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post(
  "/send-otp",
  otpLimiter,
  validate(sendOtpSchema),
  sendOtp
);

router.post(
  "/verify-otp",
  otpLimiter,
  validate(verifyOtpSchema),
  verifyOtp
);

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  login
);

router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);

export default router;

