import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                sareeId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Saree",
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                addedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

cartSchema.index(
    {
        userId: 1,
        "items.sareeId": 1
    },
    {
        unique: true
    }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;