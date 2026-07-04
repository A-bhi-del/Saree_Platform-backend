import express from "express";
import * as saleController from "../controllers/sale.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin"),
  saleController.createSale
);

router.get(
  "/",
  protect,
  authorize("admin"),
  saleController.getMySale
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  saleController.updateSale
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  saleController.deleteSale
);

export default router;