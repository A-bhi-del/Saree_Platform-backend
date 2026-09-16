import asyncHandler from "../utils/asyncHandler.js";
import * as paymentService from "../services/payment.service.js";
import Order from "../models/Order.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    userId: req.user._id
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentMethod !== "ONLINE") {
    throw new Error("This order does not require online payment");
  }

  if (order.paymentStatus === "PAID") {
    throw new Error("Order is already paid");
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
      {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.totalAmount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      },
      "Razorpay order created successfully"
    )
  );
});