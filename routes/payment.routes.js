import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment
} from "../controllers/payment.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/createPaymentOrder",
  protect,
  createPaymentOrder
);

router.post(
  "/verifyPayment",
  protect,
  verifyPayment
);

export default router;