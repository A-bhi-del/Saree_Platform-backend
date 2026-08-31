import Favourite from "../models/Favourite.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import * as notificationService from "./notification.service.js";

export const followAdmin = async (
    adminAId,
    adminBId
) => {
    if (adminAId.toString() === adminBId.toString()) {
        throw new ApiError(
            400,
            "You cannot follow yourself."
        );
    }

    const adminB = await User.findOne({
        _id: adminBId,
        role: "admin",
    });

    if (!adminB) {
        throw new ApiError(
            404,
            "Admin not found."
        );
    }

    const adminA = await User.findById({
        _id: adminAId,
        role: "admin",
    });

    if(!adminA) {
        throw new ApiError(
            404,
            "Admin not found."
        );
    }

    const alreadyFollowing = await Favourite.findOne({
        followerId: adminAId,
        followingId: adminBId
    })

    if (alreadyFollowing) {
        throw new ApiError(
            400,
            "Admin already followed."
        );
    }

    const favourite = await Favourite.create({
        followerId: adminAId,
        followingId: adminBId,
    });

    await favourite.save();

    await notificationService.createNotification({
        sender: adminAId,
        receiver: adminBId,
        type: "Follow",
        title: "New Follower",
        message: `${adminA.shopName} is starting to follow you.`,
        route: "/admin-followers",
        data: {
            adminId: adminAId,
            ShopName: adminA.shopName,
        },
    });

    return adminA;
};

export const unfollowAdmin = async (
    adminAId,
    adminBId
) => {
    const adminA = await User.findById({
        _id: adminAId,
        role: "admin",
    });
    const adminB = await User.findById({
        _id: adminBId,
        role: "admin",
    });

    if (!adminA || !adminB) {
        throw new ApiError(
            404,
            "Admin not found."
        );
    }

    await Favourite.deleteOne({
        followerId: adminAId,
        followingId: adminBId,
    });

    await notificationService.createNotification({
        sender: adminAId,
        receiver: adminBId,
        type: "Un-Follow",
        title: "Unfollow",
        message: `${adminA.shopName} is Unfollow you.`,
        route: "/",
        data: {
            adminId: adminAId,
            ShopName: adminA.shopName,
        },
    });

    return adminA;
};

export const getFollowers = async (adminId) => {
    const followers = await Favourite.find({
        followingId: adminId
    }).populate("followerId", "name email profileImage");

    return followers.map(follow => follow.followerId);
};

export const getFollowings = async (adminId) => {
    const following = await Favourite.find({
        followerId: adminId
    }).populate("followingId", "name email profileImage");

    return following.map(follow => follow.followingId);
};

export const isExist = async (followerId, followingId) => {
    return await Favourite.exists({
        followerId,
        followingId
    });
};

export const getFollowerCount = async (adminId) => {
    return await Favourite.countDocuments({
        followingId: adminId
    });
}

export const getFollowingCount = async(adminId) => {
    return await Favourite.countDocuments({
        followerId: adminId
    });
}