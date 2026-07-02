import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import generateToken from "../utils/generateToken.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";
import { otpTemplate } from "../utils/emailTemplates.js";
import ApiError from "../utils/ApiError.js";

export const registerUser = async (userData) => {
  const { name, email, password, role} = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const otpDoc = await Otp.findOne({
    email,
    isVerified: true,
  });

  if (!otpDoc) {
    throw new ApiError(400, "Please verify your email first");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  await Otp.deleteOne({
    email,
    isVerified: true,
  });

  const userResponse = user.toObject();

  delete userResponse.password;

  return userResponse;
};

export const sendOtpService = async ({ email }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  await Otp.deleteMany({ email });

  const otp = generateOTP();

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendEmail({
    to: email,
    subject: "Verify your Email",
    html: otpTemplate(otp),
  });
};

export const verifyOtpService = async ({ email, otp }) => {
  const otpDoc = await Otp.findOne({ email });

  if (!otpDoc) {
    throw new ApiError(404, "OTP not found");
  }

  if (otpDoc.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpDoc.expiresAt < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  await Otp.updateOne(
    { email },
    {
      $set: {
        isVerified: true,
      },
    }
  );
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const token = generateToken(user);

  const userResponse = user.toObject();

  delete userResponse.password;

  return {
    user: userResponse,
    token,
  };
};