import mongoose from "mongoose";

const couponRedemptionSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true
    },

    status: {
      type: String,
      enum: ["RESERVED", "REDEEMED", "RELEASED", "EXPIRED"],
      default: "RESERVED",
      index: true
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },

    eligibleSubtotal: {
      type: Number,
      required: true,
      min: 0
    },

    reservedAt: {
      type: Date,
      default: Date.now
    },

    redeemedAt: {
      type: Date,
      default: null
    },

    releasedAt: {
      type: Date,
      default: null
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

couponRedemptionSchema.index({ couponId: 1, status: 1 });
couponRedemptionSchema.index({ userId: 1, couponId: 1, status: 1 });
couponRedemptionSchema.index({ status: 1, expiresAt: 1 });
couponRedemptionSchema.index({ orderId: 1 }, { sparse: true });

const CouponRedemption = mongoose.model("CouponRedemption", couponRedemptionSchema);

export default CouponRedemption;
