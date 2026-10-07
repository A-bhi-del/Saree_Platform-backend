import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getAdminOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder
} from "../controllers/order.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = Router();

// Customer routes
router.post(
  "/createOrder",
  protect,
  authorize("customer"),
  createOrder
);

router.get(
  "/myOrders",
  protect,
  authorize("customer"),
  getMyOrders
);

router.post(
  "/:id/cancel",
  protect,
  authorize("customer"),
  cancelOrder
);

// Admin routes
router.get(
  "/adminOrders",
  protect,
  authorize("admin"),
  getAdminOrders
);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateOrderStatus
);

// Common routes (both customer and admin)
router.get(
  "/:id",
  protect,
  getOrderDetails
);

export default router;