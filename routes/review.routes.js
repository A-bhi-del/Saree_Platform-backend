import { Router } from "express";
import {
  createReview,
  getReviews,
  getRatingStats,
  getUserReviews,
  updateReview,
  deleteReview,
  toggleHelpfulVote,
  moderateReview,
  reconcileSareeStats,
  reconcileAllStats
} from "../controllers/review.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import {
  createReviewSchema,
  updateReviewSchema,
  listReviewsSchema,
  moderateReviewSchema
} from "../validators/review.validator.js";
import rateLimiter from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post(
  "/sarees/:sareeId/reviews",
  protect,
  authorize("customer"),
  rateLimiter({ Limit: 5, WindowSeconds: 60 * 60 }), 
  upload.array("images", 5),
  createReview
);

router.get(
  "/sarees/:sareeId/reviews",
  validate(listReviewsSchema, "query"),
  getReviews
);

router.get(
  "/sarees/:sareeId/reviews/stats",
  getRatingStats
);

router.get(
  "/reviews/me",
  protect,
  getUserReviews
);

router.patch(
  "/reviews/:reviewId",
  protect,
  authorize("customer"),
  validate(updateReviewSchema),
  updateReview
);

router.delete(
  "/reviews/:reviewId",
  protect,
  authorize("customer"),
  deleteReview
);

router.put(
  "/reviews/:reviewId/helpful",
  protect,
  rateLimiter({ Limit: 20, WindowSeconds: 60 * 60 }), 
  toggleHelpfulVote
);

router.delete(
  "/reviews/:reviewId/helpful",
  protect,
  toggleHelpfulVote
);

router.patch(
  "/admin/reviews/:reviewId/moderation",
  protect,
  authorize("admin"),
  validate(moderateReviewSchema),
  moderateReview
);

router.post(
  "/admin/reviews/reconcile-stats/:sareeId",
  protect,
  authorize("admin"),
  reconcileSareeStats
);

router.post(
  "/admin/reviews/reconcile-stats",
  protect,
  authorize("admin"),
  reconcileAllStats
);

export default router;
