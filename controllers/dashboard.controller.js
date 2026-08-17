import * as dashboardService from "../services/dashboard.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res, next) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const dashboard = await dashboardService.getDashboard(
      req.user._id,
      year
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Dashboard fetched successfully",
        dashboard
      )
    );
})