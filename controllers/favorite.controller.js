import * as favoriteService from "../services/favorite.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const followAdmin = asyncHandler(async (req, res, next) => {
  const admin = await favoriteService.followAdmin(
    req.user._id,
    req.params.adminId
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

export const getFavoriteAdmins = asyncHandler(async (req, res, next) => {
  const admins = await favoriteService.getFavoriteAdmins(
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