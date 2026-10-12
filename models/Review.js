import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    saree: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Saree",
      required: true,
      index: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer"
      }
    },

    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      default: ""
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"]
    },

    images: [
      {
        url: {
          type: String,
          required: true
        },
        publicId: {
          type: String,
          required: true
        }
      }
    ],

    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0
    },

    moderationStatus: {
      type: String,
      enum: ["VISIBLE", "HIDDEN", "REMOVED"],
      default: "VISIBLE",
      index: true
    },

    moderationReason: {
      type: String,
      trim: true,
      maxlength: 500
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    moderatedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ user: 1, saree: 1 }, { unique: true });

reviewSchema.index({ saree: 1, moderationStatus: 1, createdAt: -1 });

reviewSchema.index({ saree: 1, moderationStatus: 1, rating: 1, createdAt: -1 });

reviewSchema.index({ saree: 1, moderationStatus: 1, helpfulCount: -1, _id: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
