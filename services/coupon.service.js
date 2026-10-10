import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";
import CouponRedemption from "../models/CouponRedemption.js";
import Order from "../models/Order.js";
import Saree from "../models/Saree.js";
import ApiError from "../utils/ApiError.js";

const getEffectivePrice = (saree) => {
  const basePrice = saree.price;
  const discountPercentage = saree.discountPercentage || 0;
  
  if (discountPercentage > 0) {
    return Math.round(basePrice - (basePrice * discountPercentage / 100));
  }
  
  return basePrice;
};


const isSaleItem = (saree) => {
  return saree.discountPercentage && saree.discountPercentage > 0;
};


const getEligibleItems = async (cartItems, coupon) => {
  let eligibleSubtotal = 0;
  const eligibleItems = [];
  const ineligibleItems = [];

  for (const item of cartItems) {
    const saree = item.sareeId || item.saree;
    
    if (!saree) {
      console.warn("Cart item missing saree data - cart item might not be properly populated");
      continue;
    }

    if (typeof saree === 'string' || !saree.price) {
      console.warn("Cart item has unpopulated saree - ensure cart is populated with .populate('items.sareeId')");
      continue;
    }

    const effectivePrice = getEffectivePrice(saree);
    const itemTotal = effectivePrice * item.quantity;
    
    let isEligible = true;
    let ineligibilityReason = null;

    if (saree.admin && coupon.createdBy) {
      const sareeAdminId = saree.admin.toString();
      const couponAdminId = coupon.createdBy.toString();
      
      if (sareeAdminId !== couponAdminId) {
        isEligible = false;
        ineligibilityReason = "This coupon is only valid for products from a specific shop";
      }
    }

    if (isEligible && !coupon.allowSaleItems && isSaleItem(saree)) {
      isEligible = false;
      ineligibilityReason = "Sale items are not eligible for this coupon";
    }

    if (isEligible && coupon.applicableSarees && coupon.applicableSarees.length > 0) {
      const sareeIdStr = saree._id.toString();
      const isApplicable = coupon.applicableSarees.some(
        (applicableSaree) => applicableSaree.toString() === sareeIdStr
      );
      
      if (!isApplicable) {
        isEligible = false;
        ineligibilityReason = "This product is not eligible for the coupon";
      }
    }

    if (isEligible && coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      if (!coupon.applicableCategories.includes(saree.category)) {
        isEligible = false;
        ineligibilityReason = "This product category is not eligible for the coupon";
      }
    }

    if (isEligible) {
      eligibleSubtotal += itemTotal;
      eligibleItems.push({
        ...item,
        effectivePrice,
        itemTotal
      });
    } else {
      ineligibleItems.push({
        ...item,
        effectivePrice,
        itemTotal,
        ineligibilityReason
      });
    }
  }

  return {
    eligibleSubtotal,
    eligibleItems,
    ineligibleItems
  };
};


const calculateDiscountAmount = (eligibleSubtotal, coupon) => {
  let discountAmount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = Math.round((eligibleSubtotal * coupon.discountValue) / 100);
    
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === "FIXED") {
    discountAmount = Math.min(coupon.discountValue, eligibleSubtotal);
  }

  discountAmount = Math.min(discountAmount, eligibleSubtotal);
  
  discountAmount = Math.round(discountAmount * 100) / 100;

  return discountAmount;
};


export const validateCoupon = async ({ code, userId, cartItems }) => {
  const normalizedCode = code.trim().toUpperCase();

  const coupon = await Coupon.findOne({ code: normalizedCode });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new ApiError(400, "This coupon is no longer active");
  }

  const now = new Date();
  
  if (now < coupon.startsAt) {
    throw new ApiError(400, "This coupon is not yet active");
  }

  if (now > coupon.expiresAt) {
    throw new ApiError(400, "This coupon has expired");
  }

  if (coupon.usageLimit) {
    const totalRedemptions = await CouponRedemption.countDocuments({
      couponId: coupon._id,
      status: { $in: ["RESERVED", "REDEEMED"] }
    });

    if (totalRedemptions >= coupon.usageLimit) {
      throw new ApiError(400, "This coupon has reached its usage limit");
    }
  }

  const userRedemptions = await CouponRedemption.countDocuments({
    couponId: coupon._id,
    userId: userId,
    status: { $in: ["RESERVED", "REDEEMED"] }
  });

  if (userRedemptions >= coupon.perUserLimit) {
    throw new ApiError(400, "You have already used this coupon the maximum number of times");
  }

  if (coupon.firstOrderOnly) {
    const existingOrders = await Order.countDocuments({
      userId: userId,
      orderStatus: { $nin: ["CANCELLED"] }
    });

    if (existingOrders > 0) {
      throw new ApiError(400, "This coupon is only valid for first-time orders");
    }
  }

  const cartSubtotal = cartItems.reduce((acc, item) => {
    const saree = item.sareeId || item.saree;
    if (!saree) return acc;
    
    const effectivePrice = getEffectivePrice(saree);
    return acc + (effectivePrice * item.quantity);
  }, 0);

  const { eligibleSubtotal, eligibleItems, ineligibleItems } = await getEligibleItems(
    cartItems,
    coupon
  );

  if (eligibleSubtotal < coupon.minOrderAmount) {
    if (eligibleSubtotal === 0 && ineligibleItems.length > 0) {
      const reasons = [...new Set(ineligibleItems.map(i => i.ineligibilityReason))];
      throw new ApiError(
        400,
        `No items in your cart are eligible for this coupon. Reason: ${reasons.join('; ')}`
      );
    }
    
    throw new ApiError(
      400,
      `Minimum order amount of ₹${coupon.minOrderAmount} is required for this coupon. Eligible subtotal: ₹${eligibleSubtotal}`
    );
  }

  const discountAmount = calculateDiscountAmount(eligibleSubtotal, coupon);

  const finalAmount = cartSubtotal - discountAmount;

  return {
    isValid: true,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderAmount: coupon.minOrderAmount
    },
    eligibleSubtotal,
    discountAmount,
    cartSubtotal,
    finalAmount,
    eligibleItemsCount: eligibleItems.length,
    ineligibleItemsCount: ineligibleItems.length,
    message: "Coupon applied successfully"
  };
};


export const reserveCouponUsage = async ({
  couponId,
  userId,
  discountAmount,
  eligibleSubtotal,
  session
}) => {
  const coupon = await Coupon.findById(couponId).session(session);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (coupon.usageLimit) {
    const totalRedemptions = await CouponRedemption.countDocuments({
      couponId: coupon._id,
      status: { $in: ["RESERVED", "REDEEMED"] }
    }).session(session);

    if (totalRedemptions >= coupon.usageLimit) {
      throw new ApiError(400, "This coupon has reached its usage limit");
    }
  }

  const userRedemptions = await CouponRedemption.countDocuments({
    couponId: coupon._id,
    userId: userId,
    status: { $in: ["RESERVED", "REDEEMED"] }
  }).session(session);

  if (userRedemptions >= coupon.perUserLimit) {
    throw new ApiError(400, "You have already used this coupon the maximum number of times");
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const [redemption] = await CouponRedemption.create(
    [
      {
        couponId,
        userId,
        status: "RESERVED",
        discountAmount,
        eligibleSubtotal,
        expiresAt
      }
    ],
    { session }
  );

  return redemption;
};


export const finalizeCouponRedemption = async ({
  redemptionId,
  orderId,
  session
}) => {
  const redemption = await CouponRedemption.findById(redemptionId).session(session);

  if (!redemption) {
    throw new ApiError(404, "Coupon reservation not found");
  }

  if (redemption.status !== "RESERVED") {
    throw new ApiError(400, "Coupon reservation is not in RESERVED state");
  }

  redemption.status = "REDEEMED";
  redemption.orderId = orderId;
  redemption.redeemedAt = new Date();
  
  await redemption.save({ session });

  return redemption;
};


export const releaseCouponReservation = async ({
  redemptionId,
  session
}) => {
  const redemption = await CouponRedemption.findById(redemptionId).session(session);

  if (!redemption) {
    return null; 
  }

  if (redemption.status === "RELEASED" || redemption.status === "EXPIRED") {
    return redemption; 
  }

  if (redemption.status === "REDEEMED") {
    throw new ApiError(400, "Cannot release a redeemed coupon");
  }

  redemption.status = "RELEASED";
  redemption.releasedAt = new Date();
  
  await redemption.save({ session });

  return redemption;
};


export const expireOldReservations = async () => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const now = new Date();

    const expiredReservations = await CouponRedemption.find({
      status: "RESERVED",
      expiresAt: { $lt: now }
    }).session(session);

    if (expiredReservations.length === 0) {
      await session.commitTransaction();
      return { expiredCount: 0 };
    }

    await CouponRedemption.updateMany(
      {
        status: "RESERVED",
        expiresAt: { $lt: now }
      },
      {
        $set: {
          status: "EXPIRED",
          releasedAt: now
        }
      },
      { session }
    );

    for (const redemption of expiredReservations) {
      if (redemption.orderId) {
        const order = await Order.findById(redemption.orderId).session(session);
        
        if (order && order.paymentStatus === "PENDING" && order.orderStatus === "PENDING") {
          for (const item of order.items) {
            await Saree.findByIdAndUpdate(
              item.sareeId,
              { $inc: { stock: item.quantity } },
              { session }
            );
          }

          order.orderStatus = "CANCELLED";
          order.paymentStatus = "FAILED";
          await order.save({ session });
        }
      }
    }

    await session.commitTransaction();

    return { expiredCount: expiredReservations.length };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};


export const getCouponUsageStats = async (couponId) => {
  const [totalReserved, totalRedeemed, totalReleased, totalExpired] = await Promise.all([
    CouponRedemption.countDocuments({ couponId, status: "RESERVED" }),
    CouponRedemption.countDocuments({ couponId, status: "REDEEMED" }),
    CouponRedemption.countDocuments({ couponId, status: "RELEASED" }),
    CouponRedemption.countDocuments({ couponId, status: "EXPIRED" })
  ]);

  const totalUsage = totalReserved + totalRedeemed;

  return {
    totalReserved,
    totalRedeemed,
    totalReleased,
    totalExpired,
    totalUsage
  };
};

export const getUserCouponUsage = async (couponId, userId) => {
  return await CouponRedemption.countDocuments({
    couponId,
    userId,
    status: { $in: ["RESERVED", "REDEEMED"] }
  });
};


export const validateCouponForOrder = async ({ code, userId, cartItems }) => {
  try {
    const result = await validateCoupon({ code, userId, cartItems });
    return result;
  } catch (error) {
    throw error;
  }
};

export const getAvailableCouponsForCart = async ({ userId, cartItems }) => {
  if (!cartItems || cartItems.length === 0) {
    return [];
  }

  const adminIds = [...new Set(
    cartItems
      .map(item => {
        const saree = item.sareeId || item.saree;
        return saree?.admin;
      })
      .filter(Boolean)
      .map(id => id.toString())
  )];

  if (adminIds.length === 0) {
    return [];
  }

  const now = new Date();

  const coupons = await Coupon.find({
    createdBy: { $in: adminIds },
    isActive: true,
    startsAt: { $lte: now },
    expiresAt: { $gte: now }
  }).populate('createdBy', 'name shopName');

  const availableCoupons = [];

  for (const coupon of coupons) {
    try {
      if (coupon.usageLimit) {
        const totalRedemptions = await CouponRedemption.countDocuments({
          couponId: coupon._id,
          status: { $in: ["RESERVED", "REDEEMED"] }
        });
        if (totalRedemptions >= coupon.usageLimit) {
          continue;
        }
      }

      const userRedemptions = await CouponRedemption.countDocuments({
        couponId: coupon._id,
        userId: userId,
        status: { $in: ["RESERVED", "REDEEMED"] }
      });
      if (userRedemptions >= coupon.perUserLimit) {
        continue;
      }

      if (coupon.firstOrderOnly) {
        const existingOrders = await Order.countDocuments({
          userId: userId,
          orderStatus: { $nin: ["CANCELLED"] }
        });
        if (existingOrders > 0) {
          continue;
        }
      }

      const { eligibleSubtotal, eligibleItems } = await getEligibleItems(cartItems, coupon);

      if (eligibleItems.length === 0) {
        continue;
      }

      let potentialDiscount = 0;
      const meetsMinimum = eligibleSubtotal >= coupon.minOrderAmount;

      if (meetsMinimum) {
        potentialDiscount = calculateDiscountAmount(eligibleSubtotal, coupon);
      }

      availableCoupons.push({
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minOrderAmount: coupon.minOrderAmount,
        expiresAt: coupon.expiresAt,
        shopName: coupon.createdBy?.shopName || coupon.createdBy?.name || 'Shop',
        eligibleItemsCount: eligibleItems.length,
        totalEligibleAmount: eligibleSubtotal,
        potentialDiscount,
        meetsMinimum,
        applicableCategories: coupon.applicableCategories,
        firstOrderOnly: coupon.firstOrderOnly,
        allowSaleItems: coupon.allowSaleItems,
        perUserLimit: coupon.perUserLimit,
        userUsageCount: userRedemptions
      });
    } catch (error) {
      console.error(`Error processing coupon ${coupon.code}:`, error);
      continue;
    }
  }

  availableCoupons.sort((a, b) => b.potentialDiscount - a.potentialDiscount);

  return availableCoupons;
};
