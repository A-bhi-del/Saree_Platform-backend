import express from "express";
import validate from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { login, register } from "../controllers/auth.controller.js";
import { sendOtp } from "../controllers/auth.controller.js";
import { sendOtpSchema } from "../validators/auth.validator.js";
import { verifyOtp } from "../controllers/auth.controller.js";
import { verifyOtpSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post(
  "/send-otp",
  validate(sendOtpSchema),
  sendOtp
);

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  verifyOtp
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

export default router;

