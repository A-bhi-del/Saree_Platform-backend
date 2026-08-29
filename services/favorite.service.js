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

    const adminA = await User.findById(adminAId);

    const alreadyFollowing =
        adminA.following.some(
            (id) => id.toString() === adminBId.toString()
        );

    if (alreadyFollowing) {
        throw new ApiError(
            400,
            "Admin already followed."
        );
    }

    const alreadyFollower =
        adminB.followers.some(
            (id) => id.toString() === adminAId.toString()
        );

    if (alreadyFollower) {
        throw new ApiError(
            400,
            "Admin already follower."
        );
    }

    adminA.following.push(adminBId);
    adminB.followers.push(adminAId);

    await adminA.save();
    await adminB.save();

    await notificationService.createNotification({
        sender: adminAId,
        receiver: adminBId,
        type: "Follow",
        title: "New Follower",
        message: `${adminA.shopName} is starting to follow you.`,
        route: "/followers",
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
    const adminA = await User.findById(adminAId);
    const adminB = await User.findById(adminBId);

    if (!adminA || !adminB) {
        throw new ApiError(
            404,
            "Admin not found."
        );
    }

    adminA.following.pull(adminBId);
    adminB.followers.pull(adminAId);
    await adminA.save();
    await adminB.save();

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
    const admin = await User.findById(adminId)
        .populate("followers", "name email profileImage");

    return admin.followers;
};

export const getFollowings = async (adminId) => {
    const admin = await User.findById(adminId)
        .populate("following", "name email profileImage");

    return admin.following;
};