import * as shopService from "../services/shop.service.js";

export const getShopDetails = async (
  req,
  res,
  next
) => {
  try {
    const shop = await shopService.getShopDetails(
      req.params.adminId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    next(error);
  }
};