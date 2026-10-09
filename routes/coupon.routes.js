import express from "express";
import * as couponController from "../controllers/coupon.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validate.js";
import * as couponValidator from "../validators/coupon.validator.js";

const router = express.Router();

router.post(
  "/apply",
  protect,
  validate(couponValidator.applyCouponSchema),
  couponController.applyCoupon
);

router.post(
  "/validate",
  protect,
  validate(couponValidator.applyCouponSchema),
  couponController.validateCoupon
);

router.post(
  "/remove",
  protect,
  couponController.removeCoupon
);


router.post(
  "/admin",
  protect,
  authorize("admin"),
  validate(couponValidator.createCouponSchema),
  couponController.createCoupon
);

router.get(
  "/admin",
  protect,
  authorize("admin"),
  couponController.getAllCoupons
);

router.get(
  "/admin/:id",
  protect,
  authorize("admin"),
  couponController.getCouponById
);

router.patch(
  "/admin/:id",
  protect,
  authorize("admin"),
  validate(couponValidator.updateCouponSchema),
  couponController.updateCoupon
);

router.patch(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  validate(couponValidator.toggleCouponStatusSchema),
  couponController.toggleCouponStatus
);

router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  couponController.deleteCoupon
);

router.get(
  "/admin/:id/redemptions",
  protect,
  authorize("admin"),
  couponController.getCouponRedemptionHistory
);

export default router;
