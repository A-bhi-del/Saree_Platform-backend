import * as orderService from "../services/order.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  const order = await orderService.createOrder({
    userId: req.user._id,
    shippingAddress,
    paymentMethod,
    idempotencyKey,
    couponCode
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      "Order created successfully",
      order
    )
  );
});


export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const result = await orderService.getCustomerOrders(
    req.user._id,
    { page: parseInt(page), limit: parseInt(limit), status }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Orders fetched successfully",
      result.orders,
      result.pagination
    )
  );
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const result = await orderService.getAdminOrders(
    req.user._id,
    { page: parseInt(page), limit: parseInt(limit), status }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Orders fetched successfully",
      result.orders,
      result.pagination
    )
  );
});

export const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Order details fetched successfully",
      order
    )
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.user._id,
    status
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Order status updated successfully",
      order
    )
  );
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(
    req.params.id,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Order cancelled successfully",
      order
    )
  );
});
