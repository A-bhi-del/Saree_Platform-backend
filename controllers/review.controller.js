import * as reviewService from "../services/review.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const createReview = asyncHandler(async (req, res) => {
  const { sareeId } = req.params;
  let { rating, title, comment } = req.body;
  const files = req.files || [];

  rating = parseInt(rating, 10);

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be a number between 1 and 5");
  }

  if (!comment || typeof comment !== "string") {
    throw new ApiError(400, "Comment is required");
  }

  comment = comment.trim();

  if (comment.length < 10) {
    throw new ApiError(400, "Comment must be at least 10 characters");
  }

  if (comment.length > 2000) {
    throw new ApiError(400, "Comment cannot exceed 2000 characters");
  }

  if (title && typeof title === "string") {
    title = title.trim();
    if (title.length > 100) {
      throw new ApiError(400, "Title cannot exceed 100 characters");
    }
  } else {
    title = "";
  }

  if (files.length > 5) {
    throw new ApiError(400, "Maximum 5 images allowed per review");
  }

  const images = [];
  for (const file of files) {
    try {
      const result = await uploadToCloudinary(file, "saree-platform/reviews");
      images.push({
        url: result.secure_url,
        publicId: result.public_id
      });
    } catch (error) {
      throw new ApiError(500, "Failed to upload review image");
    }
  }

  const review = await reviewService.createReview({
    userId: req.user._id,
    sareeId,
    rating,
    title,
    comment,
    images
  });

  return res.status(201).json(
    new ApiResponse(201, "Review created successfully", review)
  );
});

export const getReviews = asyncHandler(async (req, res) => {
  const { sareeId } = req.params;
  const filters = req.query;

  const result = await reviewService.getReviews(sareeId, filters);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Reviews fetched successfully",
      result.reviews,
      result.pagination
    )
  );
});

export const getRatingStats = asyncHandler(async (req, res) => {
  const { sareeId } = req.params;

  const stats = await reviewService.getRatingStats(sareeId);

  return res.status(200).json(
    new ApiResponse(200, "Rating statistics fetched successfully", stats)
  );
});

export const getUserReviews = asyncHandler(async (req, res) => {
  const filters = req.query;

  const result = await reviewService.getUserReviews(req.user._id, filters);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Your reviews fetched successfully",
      result.reviews,
      result.pagination
    )
  );
});

export const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const updates = req.body;

  const review = await reviewService.updateReview(
    reviewId,
    req.user._id,
    updates
  );

  return res.status(200).json(
    new ApiResponse(200, "Review updated successfully", review)
  );
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  await reviewService.deleteReview(reviewId, req.user._id, req.user.role);

  return res.status(200).json(
    new ApiResponse(200, "Review deleted successfully")
  );
});

export const toggleHelpfulVote = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const result = await reviewService.toggleHelpfulVote(reviewId, req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      result.voted ? "Review marked as helpful" : "Helpful vote removed",
      result
    )
  );
});

export const moderateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const moderationData = req.body;

  const review = await reviewService.moderateReview(
    reviewId,
    req.user._id,
    moderationData
  );

  return res.status(200).json(
    new ApiResponse(200, "Review moderated successfully", review)
  );
});

export const reconcileSareeStats = asyncHandler(async (req, res) => {
  const { sareeId } = req.params;

  const result = await reviewService.reconcileSareeStats(sareeId);

  return res.status(200).json(
    new ApiResponse(200, "Statistics reconciled successfully", result)
  );
});

export const reconcileAllStats = asyncHandler(async (req, res) => {
  const results = await reviewService.reconcileAllStats();

  return res.status(200).json(
    new ApiResponse(200, "All statistics reconciled successfully", results)
  );
});
