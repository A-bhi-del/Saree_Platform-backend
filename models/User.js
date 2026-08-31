import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    shopName: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      index: true,
    },

    address: {
      type: String,
      default: "",
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    favoriteSarees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Saree",
      },
    ],
    
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { role: 1 },
  {
    partialFilterExpression: { role: "admin" },
    name: "admin_role_idx",
  }
);

const User = mongoose.model("User", userSchema);

export default User;