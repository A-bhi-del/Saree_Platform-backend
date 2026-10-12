import mongoose from "mongoose";
import Review from "../models/Review.js";
import ReviewVote from "../models/ReviewVote.js";
import Saree from "../models/Saree.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";

export const checkVerifiedPurchase = async (userId, sareeId) => {
  const qualifyingOrder = await Order.findOne({
    userId,
    "items.sareeId": sareeId,
    orderStatus: "DELIVERED",
    $or: [
      { paymentMethod: "COD", paymentStatus: "PENDING" },
      { paymentMethod: "ONLINE", paymentStatus: "PAID" }
    ]
  });

  return !!qualifyingOrder;
};

/**
 * Update saree rating aggregates atomically
 */
const updateSareeAggregates = async (sareeId, changes, session = null) => {
  const updateOps = {};

  if (changes.totalReviews !== undefined) {
    updateOps.totalReviews = changes.totalReviews;
  }

  if (changes.verifiedReviewCount !== undefined) {
    updateOps.verifiedReviewCount = changes.verifiedReviewCount;
  }

  if (changes.averageRating !== undefined) {
    updateOps.averageRating = changes.averageRating;
  }

  // Update rating distribution
  if (changes.ratingDistribution) {
    for (const [rating, change] of Object.entries(changes.ratingDistribution)) {
      updateOps[`ratingDistribution.${rating}`] = change;
    }
  }

  const options = session ? { session, new: true } : { new: true };

  return await Saree.findByIdAndUpdate(
    sareeId,
    { $inc: updateOps },
    options
  );
};

/**
 * Calculate aggregate changes for review operations
 */
const calculateAggregateChanges = (operation, oldReview = null, newReview = null) => {
  const changes = {
    totalReviews: 0,
    verifiedReviewCount: 0,
    ratingDistribution: {}
  };

  switch (operation) {
    case "create":
      changes.totalReviews = 1;
      if (newReview.isVerifiedPurchase) {
        changes.verifiedReviewCount = 1;
      }
      changes.ratingDistribution[newReview.rating] = 1;
      break;

    case "update":
      // Handle rating change
      if (oldReview.rating !== newReview.rating) {
        changes.ratingDistribution[oldReview.rating] = -1;
        changes.ratingDistribution[newReview.rating] = 1;
      }
      break;

    case "delete":
      changes.totalReviews = -1;
      if (oldReview.isVerifiedPurchase) {
        changes.verifiedReviewCount = -1;
      }
      changes.ratingDistribution[oldReview.rating] = -1;
      break;

    case "moderate":
      // When hiding a visible review
      if (oldReview.moderationStatus === "VISIBLE" && newReview.moderationStatus !== "VISIBLE") {
        changes.totalReviews = -1;
        if (oldReview.isVerifiedPurchase) {
          changes.verifiedReviewCount = -1;
        }
        changes.ratingDistribution[oldReview.rating] = -1;
      }
      // When showing a hidden review
      else if (oldReview.moderationStatus !== "VISIBLE" && newReview.moderationStatus === "VISIBLE") {
        changes.totalReviews = 1;
        if (oldReview.isVerifiedPurchase) {
          changes.verifiedReviewCount = 1;
        }
        changes.ratingDistribution[oldReview.rating] = 1;
      }
      break;
  }

  return changes;
};

/**
 * Recalculate average rating for a saree
 */
const recalculateAverageRating = async (sareeId, session = null) => {
  const sareeObjectId = new mongoose.Types.ObjectId(sareeId);
  
  const pipeline = [
    { 
      $match: { 
        saree: sareeObjectId, 
        moderationStatus: "VISIBLE" 
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ];

  const aggregateOptions = session ? { session } : {};
  const result = await Review.aggregate(pipeline).session(session);

  const averageRating = result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
  
  const updateOptions = session ? { session } : {};
  await Saree.findByIdAndUpdate(
    sareeId,
    { $set: { averageRating } },
    updateOptions
  );

  return averageRating;
};

/**
 * Create a new review
 */
export const createReview = async ({
  userId,
  sareeId,
  rating,
  title,
  comment,
  images = []
}) => {
  // Validate saree exists
  const saree = await Saree.findById(sareeId);
  if (!saree) {
    throw new ApiError(404, "Saree not found");
  }

  // Check verified purchase
  const isVerifiedPurchase = await checkVerifiedPurchase(userId, sareeId);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create review (unique index will prevent duplicates)
    const [review] = await Review.create(
      [
        {
          user: userId,
          saree: sareeId,
          rating,
          title: title || "",
          comment,
          images,
          isVerifiedPurchase
        }
      ],
      { session }
    );

    // Update aggregates
    const changes = calculateAggregateChanges("create", null, review);
    await updateSareeAggregates(sareeId, changes, session);
    await recalculateAverageRating(sareeId, session);

    await session.commitTransaction();

    // Populate user fields for response
    await review.populate({
      path: "user",
      select: "name profileImage"
    });

    return review;
  } catch (error) {
    await session.abortTransaction();

    // Handle duplicate review error
    if (error.code === 11000) {
      throw new ApiError(409, "You have already reviewed this saree");
    }

    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get reviews for a saree with filters and pagination
 */
export const getReviews = async (sareeId, filters) => {
  const {
    page = 1,
    limit = 10,
    sort = "newest",
    rating,
    verifiedPurchase,
    withImages
  } = filters;

  // Build query
  const query = {
    saree: sareeId,
    moderationStatus: "VISIBLE"
  };

  if (rating) {
    query.rating = rating;
  }

  if (verifiedPurchase !== undefined) {
    query.isVerifiedPurchase = verifiedPurchase;
  }

  if (withImages !== undefined && withImages) {
    query["images.0"] = { $exists: true };
  }

  // Build sort
  let sortQuery = {};
  switch (sort) {
    case "newest":
      sortQuery = { createdAt: -1, _id: -1 };
      break;
    case "oldest":
      sortQuery = { createdAt: 1, _id: 1 };
      break;
    case "highest":
      sortQuery = { rating: -1, createdAt: -1, _id: -1 };
      break;
    case "lowest":
      sortQuery = { rating: 1, createdAt: -1, _id: -1 };
      break;
    case "helpful":
      sortQuery = { helpfulCount: -1, _id: -1 };
      break;
    default:
      sortQuery = { createdAt: -1, _id: -1 };
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "name profileImage"
      })
      .lean(),
    Review.countDocuments(query)
  ]);

  return {
    reviews,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get rating statistics for a saree
 */
export const getRatingStats = async (sareeId) => {
  const saree = await Saree.findById(sareeId).select(
    "averageRating totalReviews ratingDistribution verifiedReviewCount"
  ).lean();

  if (!saree) {
    throw new ApiError(404, "Saree not found");
  }

  return {
    averageRating: saree.averageRating || 0,
    totalReviews: saree.totalReviews || 0,
    ratingDistribution: saree.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    verifiedReviewCount: saree.verifiedReviewCount || 0
  };
};

/**
 * Get current user's reviews
 */
export const getUserReviews = async (userId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ user: userId })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "saree",
        select: "name images price category"
      })
      .lean(),
    Review.countDocuments({ user: userId })
  ]);

  return {
    reviews,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get review by ID
 */
export const getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate({
      path: "user",
      select: "name profileImage"
    })
    .populate({
      path: "saree",
      select: "name images"
    });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return review;
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, userId, updates) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check ownership
  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only edit your own reviews");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const oldRating = review.rating;
    const oldReview = { ...review.toObject() };

    // Apply allowed updates
    if (updates.rating !== undefined) {
      review.rating = updates.rating;
    }
    if (updates.title !== undefined) {
      review.title = updates.title;
    }
    if (updates.comment !== undefined) {
      review.comment = updates.comment;
    }

    await review.save({ session });

    // Update aggregates if rating changed
    if (oldRating !== review.rating) {
      const changes = calculateAggregateChanges("update", oldReview, review.toObject());
      await updateSareeAggregates(review.saree, changes, session);
      await recalculateAverageRating(review.saree, session);
    }

    await session.commitTransaction();

    await review.populate({
      path: "user",
      select: "name profileImage"
    });

    return review;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId, userId, userRole) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check ownership (users can only delete their own reviews)
  if (userRole !== "admin" && review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own reviews");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Delete review images from Cloudinary
    for (const image of review.images) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (error) {
        console.error(`Failed to delete image ${image.publicId}:`, error);
        // Continue with deletion even if Cloudinary fails
      }
    }

    // Update aggregates before deletion
    const changes = calculateAggregateChanges("delete", review.toObject());
    await updateSareeAggregates(review.saree, changes, session);
    await recalculateAverageRating(review.saree, session);

    // Delete associated votes
    await ReviewVote.deleteMany({ review: reviewId }, { session });

    // Delete review
    await Review.findByIdAndDelete(reviewId, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Add or remove helpful vote
 */
export const toggleHelpfulVote = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Users cannot vote on their own reviews
  if (review.user.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot vote on your own review");
  }

  const existingVote = await ReviewVote.findOne({
    review: reviewId,
    user: userId
  });

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (existingVote) {
      // Remove vote
      await ReviewVote.findByIdAndDelete(existingVote._id, { session });
      await Review.findByIdAndUpdate(
        reviewId,
        { $inc: { helpfulCount: -1 } },
        { session }
      );

      await session.commitTransaction();
      return { voted: false, helpfulCount: review.helpfulCount - 1 };
    } else {
      // Add vote
      await ReviewVote.create([{ review: reviewId, user: userId }], { session });
      await Review.findByIdAndUpdate(
        reviewId,
        { $inc: { helpfulCount: 1 } },
        { session }
      );

      await session.commitTransaction();
      return { voted: true, helpfulCount: review.helpfulCount + 1 };
    }
  } catch (error) {
    await session.abortTransaction();

    // Handle duplicate vote error
    if (error.code === 11000) {
      throw new ApiError(400, "You have already voted on this review");
    }

    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Check if user has voted on a review
 */
export const checkUserVote = async (reviewId, userId) => {
  const vote = await ReviewVote.findOne({
    review: reviewId,
    user: userId
  });

  return !!vote;
};

/**
 * Moderate a review (admin only)
 */
export const moderateReview = async (reviewId, moderatorId, moderationData) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const oldReview = { ...review.toObject() };

    review.moderationStatus = moderationData.moderationStatus;
    review.moderationReason = moderationData.moderationReason;
    review.moderatedBy = moderatorId;
    review.moderatedAt = new Date();

    await review.save({ session });

    // Update aggregates if moderation status changed
    if (oldReview.moderationStatus !== review.moderationStatus) {
      const changes = calculateAggregateChanges("moderate", oldReview, review.toObject());
      await updateSareeAggregates(review.saree, changes, session);
      await recalculateAverageRating(review.saree, session);
    }

    await session.commitTransaction();

    return review;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Reconcile rating statistics for a saree (admin utility)
 */
export const reconcileSareeStats = async (sareeId) => {
  const saree = await Saree.findById(sareeId);

  if (!saree) {
    throw new ApiError(404, "Saree not found");
  }

  // Aggregate actual stats from reviews
  const stats = await Review.aggregate([
    {
      $match: {
        saree: new mongoose.Types.ObjectId(sareeId),
        moderationStatus: "VISIBLE"
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        verifiedReviewCount: {
          $sum: { $cond: ["$isVerifiedPurchase", 1, 0] }
        },
        rating1: {
          $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] }
        },
        rating2: {
          $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] }
        },
        rating3: {
          $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] }
        },
        rating4: {
          $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] }
        },
        rating5: {
          $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] }
        }
      }
    }
  ]);

  const actualStats = stats.length > 0 ? stats[0] : {
    totalReviews: 0,
    averageRating: 0,
    verifiedReviewCount: 0,
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0
  };

  // Update saree with reconciled stats
  saree.totalReviews = actualStats.totalReviews;
  saree.averageRating = actualStats.averageRating ? Math.round(actualStats.averageRating * 10) / 10 : 0;
  saree.verifiedReviewCount = actualStats.verifiedReviewCount;
  saree.ratingDistribution = {
    1: actualStats.rating1,
    2: actualStats.rating2,
    3: actualStats.rating3,
    4: actualStats.rating4,
    5: actualStats.rating5
  };

  await saree.save();

  return {
    sareeId,
    reconciled: true,
    stats: {
      totalReviews: saree.totalReviews,
      averageRating: saree.averageRating,
      verifiedReviewCount: saree.verifiedReviewCount,
      ratingDistribution: saree.ratingDistribution
    }
  };
};

/**
 * Reconcile all sarees' rating statistics (admin utility)
 */
export const reconcileAllStats = async () => {
  const sarees = await Saree.find().select("_id");
  const results = [];

  for (const saree of sarees) {
    try {
      const result = await reconcileSareeStats(saree._id);
      results.push(result);
    } catch (error) {
      results.push({
        sareeId: saree._id,
        reconciled: false,
        error: error.message
      });
    }
  }

  return results;
};
