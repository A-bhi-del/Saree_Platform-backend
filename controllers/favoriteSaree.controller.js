import * as favoriteSareeService from "../services/favoriteSaree.service.js";

export const addToFavoriteSarees = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await favoriteSareeService.addToFavoriteSarees(
        req.user._id,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromFavoriteSarees = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await favoriteSareeService.removeFromFavoriteSarees(
        req.user._id,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getFavoriteSarees = async (
  req,
  res,
  next
) => {
  try {
    const favorites =
      await favoriteSareeService.getFavoriteSarees(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};