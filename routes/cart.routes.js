import express from "express";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import * as cartController from "../controllers/cart.controller.js";

const router = express.Router();

router.get(
    "/cartItems",
    protect,
    authorize("customer"),
    cartController.getCart
)

router.post(
    "/addToCart",
    protect,
    authorize("customer"),
    cartController.addItemToCart
);

router.get(
    "/cartCount",
    protect,
    authorize("customer"),
    cartController.getCartCount
)

router.patch(
    "/updateCart/:sareeId",
    protect,
    authorize("customer"),
    cartController.updateCartItem
)

router.delete(
    "/deleteCartItem/:sareeId",
    protect,
    authorize("customer"),
    cartController.removeItemFromCart
)

router.delete(
    "/clearCart",
    protect,
    authorize("customer"),
    cartController.clearCart
)

router.get(
    "/validateCart",
    protect,
    authorize("customer"),
    cartController.validateCart
)

export default router;