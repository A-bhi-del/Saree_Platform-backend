import Cart from "../models/cart.js";
import Saree from "../models/Saree.js";
import ApiError from "../utils/ApiError.js";

export const addItemToCart = async ({
    userId,
    sareeId,
    quantity
}) => {
    const saree = await Saree.findById(sareeId);

    if (!saree) {
        throw new ApiError(400, "Saree not found");
    }

    if (saree.stock <= 0) {
        throw new ApiError(400, "Saree is out of stock");
    }

    if (quantity <= 0) {
        throw new ApiError(400, "Quantity must be greater than 0");
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = await Cart.create({
            userId,
            items: [
                {
                    sareeId,
                    quantity
                }
            ]
        });

        return cart;
    }

    const existingItem = cart.items.find(
        (item) => item.sareeId.toString() === sareeId.toString()
    );

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > saree.stock) {
            throw new ApiError(400,
                `Only ${saree.stock} items are available`
            );
        }
        existingItem.quantity = newQuantity;
    } else {
        if (quantity > saree.stock) {
            throw new ApiError(400,
                `Only ${saree.stock} items are available`
            );
        }

        cart.items.push({
            sareeId,
            quantity
        });
    }

    await cart.save();

    return cart;
};

export const getCart = async (userId) => {
    const cart = await Cart.findOne({ userId })
        .populate({
            path: "items.sareeId",
            select: "name price discountPercentage stock images",
        })

    if (!cart) {
        return {
            items: []
        };
    }

    return cart;
}

export const getCartCount = async (userId) => {
    const cart = await Cart.findOne({ userId })
        .select("items.quantity");

    if (!cart) {
        return 0;
    }

    return cart.items.reduce(
        (total, item) => total + item.quantity,
        0
    );
};

export const updateCartItem = async ({
    userId,
    sareeId,
    quantity
}) => {
    if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }

    const saree = await Saree.findById(sareeId);

    if (!saree) {
        throw new ApiError(400, "Saree not found");
    }

    if (saree.stock <= 0) {
        throw new ApiError(400, "Saree is out of stock");
    }

    if (quantity > saree.stock) {
        throw new ApiError(400,
            `Only ${saree.stock} items are available`
        );
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(400, "Cart not found");
    }

    const cartItem = cart.items.find(
        (item) => item.sareeId.toString() === sareeId.toString()
    );

    if (!cartItem) {
        throw new ApiError(400, "Saree is not in the cart");
    }

    cartItem.quantity = quantity;

    await cart.save();

    return cart;
};

export const removeCartItem = async ({
    userId,
    sareeId
}) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(400, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.sareeId.toString() === sareeId.toString()
    );

    if (itemIndex === -1) {
        throw new ApiError(400, "Saree is not in the cart");
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    return cart;
};

export const clearCart = async (userId) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(400, "Cart not found");
    }

    cart.items = [];
    await cart.save();
    return cart;
};

export const validateCart = async (userId) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new ApiError(400, "Cart not found");
    }

    if (cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    const validationErrors = [];

    for (const item of cart.items) {
        const saree = await Saree.findById(item.sareeId);

        if (!saree) {
            validationErrors.push({
                sareeId: item.sareeId,
                message: "Saree no longer exists"
            });
            continue;
        }

        if (saree.stock <= 0) {
            validationErrors.push({
                sareeId: item.sareeId,
                message: "Saree is out of stock"
            });

            continue;
        }

        if (item.quantity > saree.stock) {
            validationErrors.push({
                sareeId: item.sareeId,
                message: `Only ${saree.stock} items are available`,
                requestedQuantity: item.quantity,
                availableQuantity: saree.stock
            });
        }
    }

    return {
        valid: validationErrors.length === 0,
        errors: validationErrors
    };
};