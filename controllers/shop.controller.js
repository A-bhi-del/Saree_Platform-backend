import * as shopService from "../services/shop.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getShopDetails = asyncHandler(async (req, res, next) => {
    const shop = await shopService.getShopDetails(
      req.params.adminId,
      req.user._id
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Shop details fetched successfully",
        shop
      )
    );
})