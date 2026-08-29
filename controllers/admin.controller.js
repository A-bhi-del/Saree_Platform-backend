import * as adminService from "../services/admin.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAdmins = asyncHandler(async (req, res, next) => {
  const admins = await adminService.getAlladmins(
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