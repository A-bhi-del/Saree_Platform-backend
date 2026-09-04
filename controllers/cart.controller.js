import * as cartService from "../services/cart.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addItemToCart = asyncHandler(async (req, res) => {
    const createdItem = await cartService.addItemToCart(
        req.user._id,
        req.body.sareeId,
        req.body.quantity
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Item added to cart successfully",
            createdItem
        )
    )
})

export const getCart = asyncHandler(async (req, res) => {
    const Items = await cartService.getCart(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Cart fetched successfully",
            Items
        )
    )
})

export const getCartCount = asyncHandler(async (req, res) => {
    const count = await cartService.getCartCount(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Cart count fetched successfully",
            count
        )
    )
})

export const updateCartItem = asyncHandler(async (req, res) => {
    const updatedCart = await cartService.updateCartItem(
        req.user._id,
        req.params.sareeId,
        req.body.quantity
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Cart updated successfully",
            updatedCart
        )
    )
})

export const removeItemFromCart = asyncHandler(async (req, res) => {
    const removedItem = await cartService.removeCartItem(
        req.user._id,
        req.params.sareeId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Item removed from cart successfully",
            removedItem
        )
    )
})

export const clearCart = asyncHandler(async (req, res) => {
    const clearedCart = await cartService.clearCart(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Cart cleared successfully",
            clearedCart
        )
    )
})

export const validateCart = asyncHandler(async (req, res) => {
    const result = await cartService.validateCart(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Cart validated successfully",
            result
        )
    )
})