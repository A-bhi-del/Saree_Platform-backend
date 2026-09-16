import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    sareeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Saree",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    idempotencyKey: {
      type: String,
      required: true
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item"
      }
    },

    shippingAddress: {
      name: {
        type: String,
        required: true
      },

      phone: {
        type: String,
        required: true
      },

      address: {
        type: String,
        required: true
      },

      city: {
        type: String,
        required: true
      },

      state: {
        type: String,
        required: true
      },

      pincode: {
        type: String,
        required: true
      }
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING"
    },

    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
      ],
      default: "PENDING"
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true
    },

    razorpaySignature: {
      type: String
    },
  },
  {
    timestamps: true
  }
);

orderSchema.index(
  {
    userId: 1,
    idempotencyKey: 1
  },
  {
    unique: true
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;