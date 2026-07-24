import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { loginUser } from "../services/auth.service.js";
import {
  registerUser,
  sendOtpService,
  verifyOtpService,
} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  return res.status(201).json(
    new ApiResponse(
      201,
      "User registered successfully",
      user
    )
  );
});

export const sendOtp = asyncHandler(async (req, res) => {
  await sendOtpService(req.body);

  return res.status(200).json(
    new ApiResponse(
      200,
      "OTP sent successfully"
    )
  );
});

export const verifyOtp = asyncHandler(async (req, res) => {
  await verifyOtpService(req.body);

  return res.status(200).json(
    new ApiResponse(
      200,
      "OTP verified successfully"
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, 
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { user, token },
      "Login successful"
    )
  );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      "Current user fetched successfully",
      req.user
    )
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Logged out successfully"
    )
  );
});