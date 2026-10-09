import asyncHandler from "../utils/asyncHandler.js";
import * as paymentService from "../services/payment.service.js";
import * as couponService from "../services/coupon.service.js";
import Order from "../models/Order.js";
import Cart from "../models/cart.js";
import CouponRedemption from "../models/CouponRedemption.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { RAZORPAY_API_KEY } from "../config/constans.js";
import mongoose from "mongoose";

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    userId: req.user._id
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentMethod !== "ONLINE") {
    throw new ApiError(400, "This order does not require online payment");
  }

  if (order.paymentStatus === "PAID") {
    throw new ApiError(400, "Order is already paid");
  }

  const razorpayOrder = await paymentService.createRazorpayOrder({
    amount: order.totalAmount,
    receipt: order._id.toString()
  });

  order.razorpayOrderId = razorpayOrder.id;

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      "Razorpay order created successfully",
      {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        currency: razorpayOrder.currency,
        keyId: RAZORPAY_API_KEY
      }
    )
  );
});


export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    throw new ApiError(400, "Missing payment verification details");
  }

  const order = await Order.findOne({
    _id: orderId,
    userId: req.user._id
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentStatus === "PAID") {
    throw new ApiError(400, "Payment already verified");
  }

  // Verify signature
  const isValid = await paymentService.verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature
  });

  if (!isValid) {
    // Mark payment as failed
    order.paymentStatus = "FAILED";
    await order.save();
    throw new ApiError(400, "Payment verification failed");
  }

  // Use transaction for finalizing payment and coupon redemption
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Update order with payment details
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentStatus = "PAID";
    order.orderStatus = "PLACED";
    await order.save({ session });

    // Finalize coupon redemption if coupon was used
    if (order.coupon && order.coupon.couponId) {
      const redemption = await CouponRedemption.findOne({
        orderId: order._id,
        status: "RESERVED"
      }).session(session);

      if (redemption) {
        await couponService.finalizeCouponRedemption({
          redemptionId: redemption._id,
          orderId: order._id,
          session
        });
      }
    }

    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [] },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      "Payment verified successfully",
      {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus
      }
    )
  );
});
