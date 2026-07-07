import express from "express";
import * as shopController from "../controllers/shop.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/:adminId",
  protect,
  shopController.getShopDetails
);

export default router;