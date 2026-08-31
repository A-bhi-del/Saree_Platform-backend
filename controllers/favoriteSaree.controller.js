import * as favoriteSareeService from "../services/favoritesaree.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addToFavoriteSarees = asyncHandler(async (req, res, next) => {
  const result =
    await favoriteSareeService.addToFavoriteSarees(
      req.user._id,
      req.params.id
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message
    )
  );
})

export const removeFromFavoriteSarees = asyncHandler(async (req, res, next) => {
  const result =
    await favoriteSareeService.removeFromFavoriteSarees(
      req.user._id,
      req.params.id
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message
    )
  );
})

export const getFavoriteSarees = asyncHandler(async (req, res, next) => {
  const favorites =
    await favoriteSareeService.getFavoriteSarees(
      req.user._id
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Favorites fetched successfully",
      favorites
    )
  );
})