import * as couponService from "../services/coupon.service.js";
import * as adminCouponService from "../services/admin-coupon.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Cart from "../models/cart.js";

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  if (!code) {
    throw new ApiError(400, "Coupon code is required");
  }

  const cart = await Cart.findOne({ userId }).populate("items.sareeId");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const result = await couponService.validateCoupon({
    code,
    userId,
    cartItems: cart.items
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result
    )
  );
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  if (!code) {
    throw new ApiError(400, "Coupon code is required");
  }

  const cart = await Cart.findOne({ userId }).populate("items.sareeId");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const result = await couponService.validateCoupon({
    code,
    userId,
    cartItems: cart.items
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Coupon is valid",
      result
    )
  );
});

export const removeCoupon = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      "Coupon removed successfully",
      { couponRemoved: true }
    )
  );
});

export const createCoupon = asyncHandler(async (req, res) => {
  const couponData = req.body;
  const adminId = req.user._id;

  const coupon = await adminCouponService.createCoupon(couponData, adminId);

  return res.status(201).json(
    new ApiResponse(
      201,
      "Coupon created successfully",
      coupon
    )
  );
});

export const getAllCoupons = asyncHandler(async (req, res) => {
  const { page, limit, isActive, discountType, search } = req.query;

  const result = await adminCouponService.getAllCoupons({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    discountType: discountType && discountType !== "all" ? discountType : undefined,
    search
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Coupons fetched successfully",
      result.coupons,
      result.pagination
    )
  );
});

export const getCouponById = asyncHandler(async (req, res) => {
  const couponId = req.params.id;

  const coupon = await adminCouponService.getCouponById(couponId);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Coupon fetched successfully",
      coupon
    )
  );
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const couponId = req.params.id;
  const updateData = req.body;

  const coupon = await adminCouponService.updateCoupon(couponId, updateData);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Coupon updated successfully",
      coupon
    )
  );
});

export const toggleCouponStatus = asyncHandler(async (req, res) => {
  const couponId = req.params.id;
  const { isActive } = req.body;

  const coupon = await adminCouponService.toggleCouponStatus(couponId, isActive);

  return res.status(200).json(
    new ApiResponse(
      200,
      `Coupon ${isActive ? "activated" : "deactivated"} successfully`,
      coupon
    )
  );
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const couponId = req.params.id;

  const result = await adminCouponService.deleteCoupon(couponId);

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result.coupon
    )
  );
});

export const getCouponRedemptionHistory = asyncHandler(async (req, res) => {
  const couponId = req.params.id;
  const { page, limit } = req.query;

  const result = await adminCouponService.getCouponRedemptionHistory(
    couponId,
    {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Redemption history fetched successfully",
      result.redemptions,
      result.pagination
    )
  );
});
