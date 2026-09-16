import { Router } from "express";
import { createOrder } from "../controllers/order.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/createOrder",
  protect,
  authorize("customer"),
  createOrder
);

export default router;