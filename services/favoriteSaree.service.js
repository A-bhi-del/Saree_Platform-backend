import User from "../models/User.js";
import Saree from "../models/Saree.js";
import ApiError from "../utils/ApiError.js";

export const addToFavoriteSarees = async (
  userId,
  sareeId
) => {
  const saree = await Saree.findById(sareeId);

  if (!saree) {
    throw new ApiError(404, "Saree not found");
  }

  await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: {
        favoriteSarees: sareeId,
      },
    },
    {
      new: true,
    }
  );

  return {
    message: "Saree added to favourites successfully",
  };
};

export const removeFromFavoriteSarees = async (
  userId,
  sareeId
) => {
  await User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        favoriteSarees: sareeId,
      },
    },
    {
      new: true,
    }
  );

  return {
    message: "Saree removed from favourites successfully",
  };
};

export const getFavoriteSarees = async (
  userId
) => {
  const user = await User.findById(userId)
    .populate({
      path: "favoriteSarees",
      populate: {
        path: "admin",
        select: "name shopName profileImage",
      },
    })
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user.favoriteSarees;
};