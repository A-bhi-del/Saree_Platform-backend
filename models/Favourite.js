import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
    {
        followerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        followingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: true,
    }
)

favouriteSchema.index(
    {
        followerId: 1,
        followingId: 1
    },
    {
        unique: true
    }
)

favouriteSchema.index({
    followerId: 1
})

const Favourite = mongoose.model("Favourite", favouriteSchema);
export default Favourite