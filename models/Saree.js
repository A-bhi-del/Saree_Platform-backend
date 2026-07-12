import mongoose from "mongoose";

const sareeSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    fabric: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

sareeSchema.index({ category: 1 });

sareeSchema.index({ fabric: 1 });

sareeSchema.index({ color: 1 });

sareeSchema.index({ price: 1 });

sareeSchema.index({ admin: 1 });

sareeSchema.index({ createdAt: -1 });

sareeSchema.index({ isAvailable: 1 });

const Saree = mongoose.model("Saree", sareeSchema);

export default Saree;