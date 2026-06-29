import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You are not authorized to access this resource"
      );
    }

    next();
  });
};

export default authorize;