import asyncHandler from "../utils/asyncHandler.js";
import * as paymentService from "../services/payment.service.js";
import Order from "../models/Order.js";
import Cart from "../models/cart.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { RAZORPAY_API_KEY } from "../config/constans.js";

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

  // Update order with payment details
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  order.paymentStatus = "PAID";
  order.orderStatus = "PLACED";
  await order.save();

  // Clear cart after successful payment verification
  await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { items: [] }
  );

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
