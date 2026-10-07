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
    throw new ApiError(400, "Idempotency key is required");
  }

  if (!shippingAddress) {
    throw new ApiError(400, "Shipping address is required");
  }

  if (!paymentMethod) {
    throw new ApiError(400, "Payment method is required");
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
    throw new ApiError(400, "Cart is empty");
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
          404,
          `Saree ${cartItem.sareeId} is no longer available`
        );
      }

      if (!saree.isAvailable) {
        throw new ApiError(400, `${saree.name} is currently unavailable`);
      }

      if (saree.stock < cartItem.quantity) {
        throw new ApiError(
          400,
          `${saree.name} has only ${saree.stock} items available`
        );
      }

      // Calculate effective price with discount
      const basePrice = saree.price;
      const discountPercentage = saree.discountPercentage || 0;
      const currentPrice = discountPercentage > 0 
        ? Math.round(basePrice - (basePrice * discountPercentage / 100))
        : basePrice;

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
          400,
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

    // Only clear cart for COD orders
    // For ONLINE payments, cart will be cleared after payment verification
    if (paymentMethod === "COD") {
      cart.items = [];
      await cart.save({ session });
    }

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};


// Get customer orders
export const getCustomerOrders = async (userId, { page = 1, limit = 10, status } = {}) => {
  const skip = (page - 1) * limit;
  
  const query = { userId };
  if (status) {
    query.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Get admin orders (orders containing their sarees)
export const getAdminOrders = async (adminId, { page = 1, limit = 10, status } = {}) => {
  const skip = (page - 1) * limit;

  // Find orders that contain sarees from this admin
  const query = {
    "items.sareeId": {
      $in: await Saree.find({ admin: adminId }).distinct("_id")
    }
  };

  if (status) {
    query.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Get order by ID
export const getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate("userId", "name email phone address")
    .lean();

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check authorization
  if (userRole === "customer" && order.userId._id.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized to view this order");
  }

  if (userRole === "admin") {
    // Check if admin has any saree in this order
    const adminSarees = await Saree.find({ admin: userId }).distinct("_id");
    const hasAdminSaree = order.items.some(item => 
      adminSarees.some(sareeId => sareeId.toString() === item.sareeId.toString())
    );

    if (!hasAdminSaree) {
      throw new ApiError(403, "Unauthorized to view this order");
    }
  }

  return order;
};

// Update order status (admin only)
export const updateOrderStatus = async (orderId, adminId, newStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Check if admin has any saree in this order
  const adminSarees = await Saree.find({ admin: adminId }).distinct("_id");
  const hasAdminSaree = order.items.some(item => 
    adminSarees.some(sareeId => sareeId.toString() === item.sareeId.toString())
  );

  if (!hasAdminSaree) {
    throw new ApiError(403, "Unauthorized to update this order");
  }

  // Validate status transition
  const validStatuses = [
    "PENDING",
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(400, "Invalid order status");
  }

  order.orderStatus = newStatus;
  await order.save();

  return order;
};

// Cancel order (customer only - before processing)
export const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    userId: userId
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Can only cancel if order is not yet processed
  if (["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.orderStatus)) {
    throw new ApiError(400, "Cannot cancel order that is already being processed or delivered");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new ApiError(400, "Order is already cancelled");
  }

  // Restore stock
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    for (const item of order.items) {
      await Saree.findByIdAndUpdate(
        item.sareeId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    order.orderStatus = "CANCELLED";
    if (order.paymentStatus === "PAID") {
      order.paymentStatus = "REFUNDED"; // Mark for refund
    }
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
