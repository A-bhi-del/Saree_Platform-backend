import express from "express";
import * as favoriteController from "../controllers/favorite.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/:adminBId",
  protect,
  authorize("admin"),
  favoriteController.followAdmin
);

router.delete(
  "/:adminId",
  protect,
  authorize("admin"),
  favoriteController.unfollowAdmin
);

router.get(
  "/followers",
  protect,
  authorize("admin"),
  favoriteController.getFallower
);

router.get(
  "/followings",
  protect,
  authorize("admin"),
  favoriteController.getFollowing
)

router.get(
    "/exists/:adminId",
    protect,
    authorize("admin"),
    favoriteController.isExist
);

router.get(
    "/followercount",
    protect,
    authorize("admin"),
    favoriteController.getfollowercount
);

router.get(
    "/followingcount",
    protect,
    authorize("admin"),
    favoriteController.getfollowingcount
);

export default router;