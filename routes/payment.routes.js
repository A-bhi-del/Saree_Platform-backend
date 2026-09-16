import { Router } from "express";
import {
  createPaymentOrder
} from "../controllers/payment.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/createPaymentOrder",
  protect,
  createPaymentOrder
);

export default router;