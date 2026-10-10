import Coupon from "../models/Coupon.js";
import CouponRedemption from "../models/CouponRedemption.js";
import ApiError from "../utils/ApiError.js";


export const createCoupon = async (couponData, adminId) => {
  const existingCoupon = await Coupon.findOne({ 
    code: couponData.code.trim().toUpperCase() 
  });

  if (existingCoupon) {
    throw new ApiError(400, "Coupon code already exists");
  }

  const coupon = await Coupon.create({
    ...couponData,
    code: couponData.code.trim().toUpperCase(),
    createdBy: adminId
  });

  return coupon;
};


export const getAllCoupons = async ({
  page = 1,
  limit = 10,
  isActive,
  discountType,
  search,
  adminId
} = {}) => {
  const skip = (page - 1) * limit;
  
  const query = {};

  if (adminId) {
    query.createdBy = adminId;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (discountType) {
    query.discountType = discountType;
  }

  if (search) {
    query.$or = [
      { code: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .populate("createdBy", "name email shopName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Coupon.countDocuments(query)
  ]);

  const couponsWithStats = await Promise.all(
    coupons.map(async (coupon) => {
      const [totalRedeemed, totalReserved] = await Promise.all([
        CouponRedemption.countDocuments({
          couponId: coupon._id,
          status: "REDEEMED"
        }),
        CouponRedemption.countDocuments({
          couponId: coupon._id,
          status: "RESERVED"
        })
      ]);

      const totalUsage = totalRedeemed + totalReserved;

      return {
        ...coupon,
        usageStats: {
          totalRedeemed,
          totalReserved,
          totalUsage,
          remainingUsage: coupon.usageLimit ? coupon.usageLimit - totalUsage : null
        }
      };
    })
  );

  return {
    coupons: couponsWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getCouponById = async (couponId, adminId = null) => {
  const coupon = await Coupon.findById(couponId)
    .populate("createdBy", "name email shopName")
    .lean();

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (adminId && coupon.createdBy._id.toString() !== adminId.toString()) {
    throw new ApiError(403, "You don't have permission to view this coupon");
  }

  const [totalRedeemed, totalReserved, totalReleased, totalExpired] = await Promise.all([
    CouponRedemption.countDocuments({ couponId, status: "REDEEMED" }),
    CouponRedemption.countDocuments({ couponId, status: "RESERVED" }),
    CouponRedemption.countDocuments({ couponId, status: "RELEASED" }),
    CouponRedemption.countDocuments({ couponId, status: "EXPIRED" })
  ]);

  const totalUsage = totalRedeemed + totalReserved;
  return {
    ...coupon,
    usageStats: {
      totalRedeemed,
      totalReserved,
      totalReleased,
      totalExpired,
      totalUsage,
      remainingUsage: coupon.usageLimit ? coupon.usageLimit - totalUsage : null
    }
  };
};


export const updateCoupon = async (couponId, updateData, adminId = null) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (adminId && coupon.createdBy.toString() !== adminId.toString()) {
    throw new ApiError(403, "You don't have permission to update this coupon");
  }

  const redemptionCount = await CouponRedemption.countDocuments({
    couponId,
    status: { $in: ["REDEEMED", "RESERVED"] }
  });

  if (redemptionCount > 0) {
    if (updateData.discountType && updateData.discountType !== coupon.discountType) {
      throw new ApiError(
        400,
        "Cannot change discount type after coupon has been used"
      );
    }

    if (updateData.discountValue && updateData.discountValue !== coupon.discountValue) {
      throw new ApiError(
        400,
        "Cannot change discount value after coupon has been used"
      );
    }

    if (updateData.usageLimit !== undefined && updateData.usageLimit < redemptionCount) {
      throw new ApiError(
        400,
        `Cannot set usage limit below current usage count (${redemptionCount})`
      );
    }
  }

  Object.assign(coupon, updateData);
  await coupon.save();

  return coupon;
};

export const toggleCouponStatus = async (couponId, isActive, adminId = null) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (adminId && coupon.createdBy.toString() !== adminId.toString()) {
    throw new ApiError(403, "You don't have permission to modify this coupon");
  }

  coupon.isActive = isActive;
  await coupon.save();

  return coupon;
};


export const deleteCoupon = async (couponId, adminId = null) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (adminId && coupon.createdBy.toString() !== adminId.toString()) {
    throw new ApiError(403, "You don't have permission to delete this coupon");
  }

  const redemptionCount = await CouponRedemption.countDocuments({
    couponId,
    status: { $in: ["REDEEMED", "RESERVED"] }
  });

  if (redemptionCount > 0) {
    coupon.isActive = false;
    await coupon.save();

    return {
      message: "Coupon has been deactivated (soft deleted) as it has existing redemptions",
      coupon
    };
  }

  await Coupon.findByIdAndDelete(couponId);

  return {
    message: "Coupon has been permanently deleted",
    coupon: null
  };
};


export const getCouponRedemptionHistory = async (couponId, { page = 1, limit = 20 } = {}, adminId = null) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (adminId && coupon.createdBy.toString() !== adminId.toString()) {
    throw new ApiError(403, "You don't have permission to view this coupon's history");
  }

  const skip = (page - 1) * limit;

  const [redemptions, total] = await Promise.all([
    CouponRedemption.find({ couponId })
      .populate("userId", "name email")
      .populate("orderId", "totalAmount orderStatus paymentStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CouponRedemption.countDocuments({ couponId })
  ]);

  return {
    redemptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
