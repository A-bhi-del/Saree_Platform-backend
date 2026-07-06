import * as favoriteService from "../services/favorite.service.js";

export const followAdmin = async (req, res, next) => {
  try {
    const customer = await favoriteService.followAdmin(
      req.user._id,
      req.params.adminId
    );

    res.status(200).json({
      success: true,
      message: "Admin followed successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowAdmin = async (req, res, next) => {
  try {
    const customer = await favoriteService.unfollowAdmin(
      req.user._id,
      req.params.adminId
    );

    res.status(200).json({
      success: true,
      message: "Admin unfollowed successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getFavoriteAdmins = async (req, res, next) => {
  try {
    const admins = await favoriteService.getFavoriteAdmins(
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};