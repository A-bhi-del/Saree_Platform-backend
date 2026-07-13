import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    saree: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Saree",
        required: true,
    },

    requestType: {
        type: String,
        enum: ["custom", "bulk", "normal"],
        required: true,
    },

    designName: {
        type: String,
        required: true,
    },

    fabric: {
        type: String,
        required: true,
    },

    color: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        default: "",
    },

    quantity: {
        type: Number,
        required: true,
    },

    budget: {
        type: Number,
        required: true,
    },

    image: {
        type: String,
        default: "",
    },

    requiredByDate: {
        type: Date,
    },

    customerDeleted: {
        type: Boolean,
        default: false,
    },

    adminDeleted: {
        type: Boolean,
        default: false,
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
},
    {
        timestamps: true
    }
);

const Request = mongoose.model("Request", requestSchema);
export default Request;