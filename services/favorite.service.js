import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export const followAdmin = async (
    customerId,
    adminId
) => {

    if (customerId.toString() === adminId.toString()) {
        throw new ApiError(
            400,
            "You cannot follow yourself."
        );
    }

    const admin = await User.findOne({
        _id: adminId,
        role: "admin",
    });

    if (!admin) {
        throw new ApiError(
            404,
            "Admin not found."
        );
    }

    const customer = await User.findById(customerId);

    const alreadyFollowing =
        customer.favoriteAdmins.some(
            (id) => id.toString() === adminId.toString()
        );

    if (alreadyFollowing) {
        throw new ApiError(
            400,
            "Admin already followed."
        );
    }

    customer.favoriteAdmins.push(adminId);

    await customer.save();

    return customer;
};

export const unfollowAdmin = async (
    customerId,
    adminId
) => {

    const customer = await User.findById(customerId);

    customer.favoriteAdmins.pull(adminId);

    await customer.save();

    return customer;
};

export const getFavoriteAdmins = async (
    customerId
) => {

    const customer = await User.findById(
        customerId
    ).populate(
        "favoriteAdmins",
        "name email profileImage"
    );

    return customer.favoriteAdmins;
};

export const getFollowers = async (adminId) => {

    return await User.find({

        role:"customer",

        favoriteAdmins:adminId

    });

};