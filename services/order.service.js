import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/cart.js";
import ApiError from "../utils/ApiError.js";
import Saree from "../models/saree.js";

export const createOrder = async ({
  userId,
  shippingAddress,
  paymentMethod,
  idempotencyKey
}) => {
  if (!idempotencyKey) {
    throw new ApiError("Idempotency key is required");
  }

  if (!shippingAddress) {
    throw new ApiError("Shipping address is required");
  }

  if (!paymentMethod) {
    throw new ApiError("Payment method is required");
  }

  const existingOrder = await Order.findOne({
    userId,
    idempotencyKey
  });

  if (existingOrder) {
    return existingOrder;
  }

  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError("Cart is empty");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const saree = await Saree.findById(cartItem.sareeId).session(session);

      if (!saree) {
        throw new ApiError(
          `Saree ${cartItem.sareeId} is no longer available`
        );
      }

      if (!saree.isAvailable) {
        throw new ApiError(`${saree.name} is currently unavailable`);
      }

      if (saree.stock < cartItem.quantity) {
        throw new ApiError(
          `${saree.name} has only ${saree.stock} items available`
        );
      }

      const currentPrice = saree.price;

      orderItems.push({
        sareeId: saree._id,
        name: saree.name,
        price: currentPrice,
        quantity: cartItem.quantity
      });

      subtotal += currentPrice * cartItem.quantity;
    }

    const discount = 0;

    const totalAmount = subtotal - discount;

    for (const item of orderItems) {
      const updatedSaree = await Saree.findOneAndUpdate(
        {
          _id: item.sareeId,
          stock: { $gte: item.quantity },
          isAvailable: true
        },
        {
          $inc: {
            stock: -item.quantity
          }
        },
        {
          new: true,
          session
        }
      );

      if (!updatedSaree) {
        throw new ApiError(
          `${item.name} is no longer available in requested quantity`
        );
      }
    }

    const [order] = await Order.create(
      [
        {
          userId,
          idempotencyKey,
          items: orderItems,
          shippingAddress,
          subtotal,
          discount,
          totalAmount,
          paymentMethod,
          paymentStatus:
            paymentMethod === "COD" ? "PENDING" : "PENDING",
          orderStatus:
            paymentMethod === "COD" ? "PLACED" : "PENDING"
        }
      ],
      {
        session
      }
    );

    cart.items = [];

    await cart.save({ session });
    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};