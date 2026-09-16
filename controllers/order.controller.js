import * as orderService from "../services/order.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  const order = await orderService.createOrder({
    userId: req.user._id,
    shippingAddress,
    paymentMethod,
    idempotencyKey
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      order,
      "Order created successfully"
    )
  );
});