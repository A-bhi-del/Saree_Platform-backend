import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      required: true
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0
    },

    maxDiscountAmount: {
      type: Number,
      default: null,
      min: 0
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    startsAt: {
      type: Date,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    },

    usageLimit: {
      type: Number,
      default: null,
      min: 1
    },

    perUserLimit: {
      type: Number,
      default: 1,
      min: 1
    },

    applicableSarees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Saree"
      }
    ],

    applicableCategories: [
      {
        type: String,
        trim: true
      }
    ],

    firstOrderOnly: {
      type: Boolean,
      default: false
    },

    allowSaleItems: {
      type: Boolean,
      default: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

couponSchema.pre("save", function (next) {
  if (this.discountType === "PERCENTAGE" && this.discountValue > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }

  if (this.discountType === "PERCENTAGE" && this.discountValue <= 0) {
    throw new Error("Percentage discount must be greater than 0");
  }

  if (this.discountType === "FIXED" && this.discountValue <= 0) {
    throw new Error("Fixed discount must be greater than 0");
  }

  if (this.discountType === "FIXED" && this.maxDiscountAmount) {
    this.maxDiscountAmount = null;
  }

  if (this.expiresAt <= this.startsAt) {
    throw new Error("Expiration date must be after start date");
  }

  next();
});

couponSchema.pre("save", function (next) {
  if (this.code) {
    this.code = this.code.trim().toUpperCase();
  }
  next();
});

couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

couponSchema.index({ applicableCategories: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
