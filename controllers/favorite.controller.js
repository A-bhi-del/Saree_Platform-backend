import * as favoriteService from "../services/favorite.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const followAdmin = asyncHandler(async (req, res, next) => {
  const admin = await favoriteService.followAdmin(
    req.user._id,
    req.params.adminBId
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Admin followed successfully",
      admin
    )
  );
})

export const unfollowAdmin = asyncHandler(async (req, res, next) => {
  const admin = await favoriteService.unfollowAdmin(
    req.user._id,
    req.params.adminId
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Admin unfollowed successfully",
      admin,
    )
  );
})

export const getFallower = asyncHandler(async (req, res, next) => {
  const admins = await favoriteService.getFollowers(
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Admins fetched successfully",
      admins
    )
  );
})

export const getFollowing = asyncHandler(async (req, res) => {
  const admins = await favoriteService.getFollowings(
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Admins fetched successfully",
      admins
    )
  );
})

export const isExist = asyncHandler(async (req, res) => {
    const result = await favoriteService.isExist(
        req.user._id,
        req.params.adminId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Follow status fetched successfully",
            !!result
        )
    );
});

export const getfollowercount = asyncHandler(async (req, res) => {
    const result = await favoriteService.getFollowerCount(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Follow status fetched successfully",
            result
        )
    );
});

export const getfollowingcount = asyncHandler(async (req, res) => {
    const result = await favoriteService.getFollowingCount(
        req.user._id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Follow status fetched successfully",
            result
        )
    );
});