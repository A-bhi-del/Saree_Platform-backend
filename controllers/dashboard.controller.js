import * as dashboardService from "../services/dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getDashboard(
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};